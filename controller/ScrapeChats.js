const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const UploadToCloudinary = require('./UploadToCloudinary'); // Import the upload function
const fs = require('fs');
const path = require('path');

const ScrapeChats = async (req, res) => {
  try {
    const chatUrl = req.query.chatUrl;
    if (!chatUrl) {
      return res.status(400).json({ error: 'Chat URL is required.' });
    }

    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.goto(chatUrl, { waitUntil: 'networkidle2' });

    const chatSelector = '[data-message-author-role]';
    await page.waitForSelector(chatSelector, { timeout: 60000 });

    const chatMessages = await page.evaluate(() => {
      const assistantSelector = '[data-message-author-role="assistant"]';
      const userSelector = '[data-message-author-role="user"]';

      const extractMessages = (selector) =>
        Array.from(document.querySelectorAll(selector)).map((el) => el.innerText.trim());

      return {
        assistant: extractMessages(assistantSelector),
        user: extractMessages(userSelector),
      };
    });

    await browser.close();

    if ((!chatMessages.assistant || chatMessages.assistant.length === 0) &&
        (!chatMessages.user || chatMessages.user.length === 0)) {
      return res.status(400).json({ error: 'No messages found for either role.' });
    }

    // Generate the PDF file
    const tempFilePath = path.join('/tmp', `chat-${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(tempFilePath);

    doc.pipe(writeStream);

    // Add content to PDF
    doc.fontSize(16).fillColor('blue').text('Chat Conversation', { align: 'center' });
    doc.moveDown();

    const maxLength = Math.max(chatMessages.user.length, chatMessages.assistant.length);
    for (let i = 0; i < maxLength; i++) {
      if (chatMessages.user[i]) {
        doc.fillColor('green').fontSize(12).text(`User: ${chatMessages.user[i]}`);
        doc.moveDown();
      }
      if (chatMessages.assistant[i]) {
        doc.fillColor('red').fontSize(12).text(`Assistant: ${chatMessages.assistant[i]}`);
        doc.moveDown();
      }
    }

    doc.end();

    // Wait for the file to be written
    writeStream.on('finish', async () => {
      try {
        // Upload the generated PDF to Cloudinary
        const uploadResult = await UploadToCloudinary(tempFilePath);

        // Delete the temporary file
        fs.unlinkSync(tempFilePath);

        // Respond with the Cloudinary URL
        res.status(200).json({
          message: 'PDF uploaded successfully',
          url: uploadResult,
        });
      } catch (uploadError) {
        console.error('Error uploading PDF to Cloudinary:', uploadError);
        res.status(500).json({ error: 'Failed to upload PDF to Cloudinary' });
      }
    });
  } catch (error) {
    console.error('Error processing chat URL:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat URL.' });
  }
};

module.exports = ScrapeChats;
