const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();
const {
  getFavoriteArtists,
  toggleFavorite,
  getRecentFavorites,
  getRecentRatedArtists,
  getRecentReviews,
  getUserReviews,
} = require("../controllers/usersDataControllers");

// GET user's favorite artists
router.get("/favorites", requireAuth, getFavoriteArtists);

// Get recent favorite artists
router.get("/recentfavorites", requireAuth, getRecentFavorites);

// Get recently rated artists
router.get("/recentlyrated", requireAuth, getRecentRatedArtists);

// Get recent and all reviews
router.get("/recentreviews", requireAuth, getRecentReviews);
router.get("/myreviews", requireAuth, getUserReviews);

// Toggle favorite
router.post("/:id/favorite", requireAuth, toggleFavorite);

module.exports = router;
