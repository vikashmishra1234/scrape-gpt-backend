const chromium = require('playwright-aws-lambda');

const ScrapeChats = async (req, res) => {
  try {
    const chatUrl = req.query.chatUrl;

    if (!chatUrl) {
      return res.status(400).json({ error: 'Chat URL is required.' });
    }

    // Launch Chromium using playwright-aws-lambda
    const browser = await chromium.launchChromium({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Use a valid `waitUntil` option for Playwright
    await page.goto(chatUrl, { waitUntil: 'networkidle' }); // Replace `networkidle2` with `networkidle`

    // Your scraping logic here...
    const chatSelector = 'div[class*="conversation-turn"]';
    await page.waitForSelector(chatSelector, { timeout: 60000 });

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

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error processing chat URL:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat URL.' });
  }
};

module.exports = ScrapeChats;
