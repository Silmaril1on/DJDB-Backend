const mongoose = require("mongoose");
const Artist = require("../models/artistsModel");
const User = require("../models/userModel");

//GET USER'S RATING FOR ARTIST
const getUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Artist ID" });
    }
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    const userRating = artist.ratings.find(
      (rating) => rating.userId.toString() === userId.toString()
    );
    res.status(200).json({
      rating: userRating ? userRating.score : null,
      ratingStats: artist.ratingStats,
    });
  } catch (error) {
    console.error("Error in getUserRating:", error);
    res.status(400).json({ error: error.message });
  }
};

// RATE AN ARTIST
const rateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.user._id;
    const username = req.user.username;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Artist ID" });
    }
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ error: "Rating must be between 1 and 10" });
    }
    // Find the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    // Update artist's ratings
    const existingRatingIndex = artist.ratings.findIndex(
      (rating) => rating.userId.toString() === userId.toString()
    );
    if (existingRatingIndex !== -1) {
      // Update existing rating
      artist.ratings[existingRatingIndex].score = score;
    } else {
      // Add new rating
      artist.ratings.push({ userId, score, username });
    }
    // Update user's rated artists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingUserRating = user.ratedArtists.find(
      (rating) => rating.artistId.toString() === id
    );
    if (existingUserRating) {
      existingUserRating.rating = score;
      existingUserRating.ratedAt = new Date();
    } else {
      user.ratedArtists.push({
        artistId: id,
        rating: score,
      });
    }
    // Recalculate rating statistics and save both documents
    artist.calculateRatingStats();
    await Promise.all([artist.save(), user.save()]);
    res.status(200).json({
      ratingStats: artist.ratingStats,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.error("Error in rateArtist:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  rateArtist,
  getUserRating,
};
