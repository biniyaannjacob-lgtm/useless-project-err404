const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.get("/test", (req, res) => {
  res.json({ message: "Test successful" });
});

module.exports = app;
