const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { dbConnection } = require("./Db");
const Router = require("./routes/routes");
const path = require('path');


dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
// Serve static files (like PDFs) from the 'public' directory
app.use('/chats', express.static(path.join(__dirname, 'chats')));
app.use(cookieParser());
app.use(express.json());
app.use('/',Router)

dbConnection();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
