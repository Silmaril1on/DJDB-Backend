const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getUserRating,
  rateArtist,
} = require("../controllers/ratingControllers");
const router = express.Router();

// Rating Routes

router.post("/:id/rate", requireAuth, rateArtist);

router.get("/:id/rating", requireAuth, getUserRating);

module.exports = router;
