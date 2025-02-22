const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getArtistReviews,
  addReview,
  updateReview,
  deleteReview,
  toggleReviewReaction,
} = require("../controllers/reviewControllers");

// Reviews routes
router.get("/:id/reviews", getArtistReviews);
router.post("/:id/reviews", requireAuth, addReview);
router.post("/:id/reviews/:reviewId", requireAuth, updateReview);
router.delete("/:id/reviews/:reviewId", requireAuth, deleteReview);
router.post("/:id/reviews/:reviewId/react", requireAuth, toggleReviewReaction);

module.exports = router;
