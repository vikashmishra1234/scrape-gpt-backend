const express = require('express');
const ScrapeChats = require('../controller/ScrapeChats');
const Router = express.Router();

Router.get('/',(req,res)=>{
    res.send("hello from the backend")
})
Router.get('/scrape-chat',ScrapeChats);



module.exports = Router