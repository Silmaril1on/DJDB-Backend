const express = require("express");
const { searchAll } = require("../controllers/searchControllers");
const router = express.Router();

router.get("/", searchAll);

module.exports = router;
