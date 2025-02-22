const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ratingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const artistSchema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    stageName: { type: String, default: false },
    country: { type: String, required: true },
    city: { type: String, required: true },
    label: { type: String, required: true },
    bio: { type: String, required: true },
    birth: { type: String, required: true },
    genre: [{ type: String, required: true }],
    flag: { type: String, required: true },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    profiles: [
      {
        name: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
    ratings: [ratingSchema],
    reviews: [reviewSchema],
    ratingStats: {
      averageScore: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      metaScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Calculate rating statistics when a rating is added or modified
artistSchema.methods.calculateRatingStats = function () {
  if (this.ratings.length === 0) {
    this.ratingStats = {
      averageScore: 0,
      totalRatings: 0,
      metaScore: 0,
    };
    return;
  }

  const totalScore = this.ratings.reduce(
    (sum, rating) => sum + rating.score,
    0
  );
  const averageScore = totalScore / this.ratings.length;

  this.ratingStats = {
    averageScore: Number(averageScore.toFixed(1)),
    totalRatings: this.ratings.length,
    metaScore: Math.round(averageScore * 10), // Convert to 0-100 scale
  };
};

module.exports = mongoose.model("Artist", artistSchema);
