const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    poster: {
      type: String,
    },
    headline: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    clip: {
      type: String,
    },
    newsLink: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("New", newsSchema);
