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

const festivalSchema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    info: { type: String, required: true },
    flag: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    dates: { type: String, required: true },
    founders: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Festival", festivalSchema);
