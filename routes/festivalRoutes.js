const express = require("express");
const {
  getFestivals,
  createFestival,
  getRandomFestivals,
} = require("../controllers/festivalControllers");
const router = express.Router();

router.get("/", getFestivals);
router.get("/randomfestival", getRandomFestivals);
router.post("/", createFestival);

module.exports = router;
