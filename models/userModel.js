const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userReviewSchema = new Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true,
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ratedArtistSchema = new Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  ratedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
    },
    image: {
      type: String,
      default: "",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
    ratedArtists: [ratedArtistSchema],
    reviews: [userReviewSchema],
    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.statics.signup = async function (email, password, username) {
  if (!email || !password || !username) {
    throw Error("All fields must be filled");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw Error("Username can only contain letters, numbers, and underscores");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("For Better Security, include Numbers & Symbols as well");
  }
  const exists = await this.findOne({ email, username });
  if (exists) {
    throw Error("Email or Username is already used");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash, username });
  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Invalid credentials");
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Invalid credentials");
  }

  return user;
};

userSchema.methods.setPassword = async function (password) {
  if (!validator.isStrongPassword(password)) {
    throw Error("For Better Security, include Numbers & Symbols as well");
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
  return this.password;
};

module.exports = mongoose.model("User", userSchema);
