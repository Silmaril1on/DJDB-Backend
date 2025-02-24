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

router.get("/favorites", requireAuth, getFavoriteArtists);
router.get("/recentfavorites", requireAuth, getRecentFavorites);
router.get("/recentlyrated", requireAuth, getRecentRatedArtists);
router.get("/recentreviews", requireAuth, getRecentReviews);
router.get("/myreviews", requireAuth, getUserReviews);
router.post("/:id/favorite", requireAuth, toggleFavorite);

module.exports = router;
