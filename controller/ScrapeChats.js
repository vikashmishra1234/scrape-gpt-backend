const puppeteer = require('puppeteer');

const ScrapeChats = async (req, res) => {
  try {
    const chatUrl = req.query.chatUrl;
    if (!chatUrl) {
      return res.status(400).json({ error: 'Chat URL is required.' });
    }

    const browser = await puppeteer.launch({
      args:[
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote"
      ],
      executablePath:process.env.NODE_ENV==="production"?
      process.env.PUPPETEER_EXECUTATBLE_PATH: puppeteer.executablePath()
    });
    const page = await browser.newPage();

    await page.goto(chatUrl, { waitUntil: 'networkidle2' });

    // Wait for any chat container to appear
    const chatSelector = '[data-message-author-role]';
    await page.waitForSelector(chatSelector, { timeout: 60000 });

    // Extract messages separately for assistant and user
    const chatMessages = await page.evaluate(() => {
      const assistantSelector = '[data-message-author-role="assistant"]';
      const userSelector = '[data-message-author-role="user"]';

      const extractMessages = (selector) => {
        return Array.from(document.querySelectorAll(selector)).map((el) => el.innerText.trim());
      };

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

    // Save messages to a PDF alternately
    const fs = require('fs');
    const PDFDocument = require('pdfkit');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(process.cwd(), `chats/chat-${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Title
    doc.fontSize(16).fillColor('blue').text('Chat Conversation', { align: 'center' });
    doc.moveDown();

    // Interleave user and assistant messages
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

    writeStream.on('finish', () => {
      res.status(200).json({ message: 'PDF created successfully', filePath });
    });
  } catch (error) {
    console.error('Error processing chat URL:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat URL.' });
  }
};

module.exports = ScrapeChats;
