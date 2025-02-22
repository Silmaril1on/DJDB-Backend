const mongoose = require("mongoose");
const User = require("../models/userModel");
const Artist = require("../models/artistsModel");

// GET ARTIST REVIEWS
const getArtistReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Artist ID" });
    }
    const artist = await Artist.findById(id).select(
      "reviews name flag image stageName ratingStats country city"
    );
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    res.status(200).json(artist);
  } catch (error) {
    console.error("Error in getArtistReviews:", error);
    res.status(400).json({ error: error.message });
  }
};

// ADD REVIEW FOR ARTIST
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { header, comment } = req.body;
    const userId = req.user._id;
    const username = req.user.username;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Artist ID" });
    }
    if (!header || header.trim().length === 0) {
      return res.status(400).json({ error: "Review header is required" });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Review comment is required" });
    }
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    // Create new review
    const newReview = {
      userId,
      username,
      header,
      comment,
      likes: [],
      dislikes: [],
      createdAt: new Date(),
    };
    // Add review to artist
    artist.reviews.push(newReview);
    await artist.save();

    // Get the created review's ID
    const createdReview = artist.reviews[artist.reviews.length - 1];

    // Add review to user's reviews
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.reviews.push({
      artistId: id,
      reviewId: createdReview._id,
      header,
      comment,
      createdAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      message: "Review added successfully",
      review: createdReview,
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(400).json({ error: error.message });
  }
};

// UPDATE REVIEW
const updateReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { header, comment } = req.body;
    const userId = req.user._id;
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    const artistReview = artist.reviews.id(reviewId);
    if (!artistReview) {
      return res.status(404).json({ error: "Review not found" });
    }
    if (artistReview.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this review" });
    }
    artistReview.header = header;
    artistReview.comment = comment;
    await artist.save();
    // Update review in user document
    const user = await User.findById(userId);
    const userReview = user.reviews.find(
      (r) => r.reviewId.toString() === reviewId
    );
    if (userReview) {
      userReview.header = header;
      userReview.comment = comment;
      userReview.updatedAt = new Date();
      await user.save();
    }
    res.status(200).json({
      message: "Review updated successfully",
      review: artistReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(400).json({ error: error.message });
  }
};

// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user._id;
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    // Remove review from artist document
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    const review = artist.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    if (review.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this review" });
    }
    artist.reviews.pull(reviewId);
    await artist.save();
    // Remove review from user document
    const user = await User.findById(userId);
    user.reviews = user.reviews.filter(
      (r) => r.reviewId.toString() !== reviewId
    );
    await user.save();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(400).json({ error: error.message });
  }
};

// Like - Dislike review
const toggleReviewReaction = async (req, res) => {
  try {
    const { id: artistId, reviewId } = req.params;
    const { action } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;
    if (
      !mongoose.Types.ObjectId.isValid(artistId) ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    const review = artist.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    // Initialize arrays if they don't exist
    if (!review.likes) review.likes = [];
    if (!review.dislikes) review.dislikes = [];

    const hasLiked = review.likes.includes(userId);
    const hasDisliked = review.dislikes.includes(userId);

    // Handle the reaction toggle
    if (action === "like") {
      if (hasLiked) {
        // Remove like
        review.likes = review.likes.filter((id) => !id.equals(userId));
      } else {
        // Add like and remove dislike if exists
        review.likes.push(userId);
        review.dislikes = review.dislikes.filter((id) => !id.equals(userId));
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        // Remove dislike
        review.dislikes = review.dislikes.filter((id) => !id.equals(userId));
      } else {
        // Add dislike and remove like if exists
        review.dislikes.push(userId);
        review.likes = review.likes.filter((id) => !id.equals(userId));
      }
    }
    await artist.save();
    res.status(200).json({
      likes: review.likes.length,
      dislikes: review.dislikes.length,
      hasLiked: review.likes.includes(userId),
      hasDisliked: review.dislikes.includes(userId),
    });
  } catch (error) {
    console.error("Error in toggleReviewReaction:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  toggleReviewReaction,
  getArtistReviews,
  addReview,
  deleteReview,
  updateReview,
};
