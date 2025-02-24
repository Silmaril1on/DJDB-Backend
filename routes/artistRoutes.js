const express = require("express");
const router = express.Router();
const {
  getArtists,
  getRandomArtists,
  getSingleArtist,
  createArtist,
  getBornTodayArtists,
} = require("../controllers/artistControllers");

router.get("/", getArtists);
router.get("/randomartists", getRandomArtists);
router.get("/borntoday", getBornTodayArtists);
router.get("/:id", getSingleArtist);
router.post("/", createArtist);

module.exports = router;
