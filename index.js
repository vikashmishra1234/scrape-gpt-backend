const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Router = require("./routes/routes");
const path = require('path');


dotenv.config();


const app = express();
const PORT =process.env.PORT || 5000;

app.use(
  cors({
    origin:["https://chatgptpdf.vercel.app","http://localhost:5173"],
    methods: ["POST", "GET"],
    credentials: true
  })
);
app.use('/chats', express.static(path.join(__dirname, 'chats')));

app.use(express.json());
app.use('/',Router)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
