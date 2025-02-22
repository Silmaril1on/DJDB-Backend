const mongoose = require("mongoose");
const User = require("../models/userModel");
const Artist = require("../models/artistsModel");

// Get users favorite artists
const getFavoriteArtists = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const favoriteArtists = await Artist.find({
      _id: { $in: user.favorites },
    }).select("name image flag _id ratingStats country city stageName");
    const artistsWithFavorites = favoriteArtists.map((artist) => ({
      ...artist.toObject(),
      isFavorite: true,
    }));
    res.status(200).json(artistsWithFavorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// TOGGLE FAVORITE
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Artist ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isFavorite = user.favorites.includes(id);
    if (isFavorite) {
      await User.findByIdAndUpdate(userId, {
        $pull: { favorites: id },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { favorites: id },
      });
    }
    res.status(200).json({
      isFavorite: !isFavorite,
    });
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get users recent favorites (last 5 item)
const getRecentFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    const recentFavIds = user.favorites.slice(-6).reverse();
    const recentFavs = await Artist.find({
      _id: { $in: recentFavIds },
    }).select("name stageName image");
    const orderedFavs = recentFavIds.map((id) =>
      recentFavs.find((artist) => artist._id.toString() === id.toString())
    );
    res.status(200).json(orderedFavs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's recently rated artists (last 5 items)
const getRecentRatedArtists = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const recentRatings = user.ratedArtists
      .sort((a, b) => b.ratedAt - a.ratedAt)
      .slice(0, 6);
    const artistIds = recentRatings.map((rating) => rating.artistId);
    const artists = await Artist.find(
      { _id: { $in: artistIds } },
      "name stageName image"
    );
    const recentRatedArtists = recentRatings.map((rating) => {
      const artist = artists.find(
        (a) => a._id.toString() === rating.artistId.toString()
      );
      return {
        ...artist.toObject(),
        rating: rating.rating,
        ratedAt: rating.ratedAt,
      };
    });
    res.status(200).json(recentRatedArtists);
  } catch (error) {
    console.error("Error in getRecentRatedArtists:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRecentReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const recentReviews = user.reviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);
    const artistIds = recentReviews.map((review) => review.artistId);
    const artists = await Artist.find(
      { _id: { $in: artistIds } },
      "name stageName image"
    );
    const recentUserReviews = recentReviews.map((review) => {
      const artist = artists.find(
        (a) => a._id.toString() === review.artistId.toString()
      );
      return {
        id: review._id,
        artist: artist ? artist.toObject() : null,
        header: review.header,
        comment: review.comment,
        createdAt: review.createdAt,
      };
    });
    res.status(200).json(recentUserReviews);
  } catch (error) {
    console.error("Error in getRecentReviews:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET USER'S REVIEWS
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Get the artist details for the reviews
    const artistIds = user.reviews.map((review) => review.artistId);
    const artists = await Artist.find(
      { _id: { $in: artistIds } },
      "name stageName image"
    );
    // Combine review data with artist details
    const reviewsWithArtistDetails = user.reviews.map((review) => {
      const artist = artists.find(
        (a) => a._id.toString() === review.artistId.toString()
      );
      return {
        id: review._id, // Include review ID
        reviewId: review.reviewId,
        artistId: review.artistId,
        userId: review.userId,
        header: review.header,
        comment: review.comment,
        createdAt: review.createdAt,
        artistName: artist ? artist.stageName || artist.name : "Unknown Artist",
        artistImage: artist ? artist.image : null,
      };
    });
    res.status(200).json(reviewsWithArtistDetails);
  } catch (error) {
    console.error("Error in getUserReviews:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFavoriteArtists,
  getRecentFavorites,
  toggleFavorite,
  getRecentRatedArtists,
  getRecentReviews,
  getUserReviews,
};
