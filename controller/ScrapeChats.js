const chromium = require('playwright-aws-lambda');

const ScrapeChats = async (req, res) => {
  try {
    const chatUrl = req.query.chatUrl;
    if (!chatUrl) {
      return res.status(400).json({ error: 'Chat URL is required.' });
    }

    // Launch Playwright

    const browser = await chromium.puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    

    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the URL
    await page.goto(chatUrl, { waitUntil: 'networkidle' });

    // Wait for dynamic content to load
    const chatSelector = 'div[class*="conversation-turn"]';
    await page.waitForSelector(chatSelector, { timeout: 60000 });

    // Extract chat messages
    const messages = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements)
        .map((el) => el.innerText.trim())
        .join('\n\n');
    }, chatSelector);

    await browser.close();

    if (!messages) {
      return res.status(400).json({ error: 'Failed to extract chat messages.' });
    }

    // Generate PDF (unchanged from your Puppeteer code)
    const fs = require('fs');
    const PDFDocument = require('pdfkit');
    const path = require('path');

    const doc = new PDFDocument();
    const filePath = path.join(process.cwd(), `chats/chat-${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(16).text('Chat Conversation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(messages);
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
