const express = require("express");
const router = express.Router();
const {
  getArtists,
  getRandomArtists,
  getSingleArtist,
  createArtist,
} = require("../controllers/artistControllers");

// GET all artists
router.get("/", getArtists);

// router.get("/", getArtists);
router.get("/randomartists", getRandomArtists);

// GET SINGLE artist
router.get("/:id", getSingleArtist);

// CREATE artist
router.post("/", createArtist);

module.exports = router;
