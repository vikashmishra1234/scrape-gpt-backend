const express = require('express');
const ScrapeChats = require('../controller/ScrapeChats');
const Router = express.Router();

Router.get('/scrape-chat',ScrapeChats);



module.exports = Router