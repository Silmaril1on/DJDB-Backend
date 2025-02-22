const express = require("express");
const { getNews, createNews } = require("../controllers/newsControllers");
const router = express.Router();

router.get("/", getNews);

router.post("/", createNews);

module.exports = router;
