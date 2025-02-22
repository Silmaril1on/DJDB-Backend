const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// LOGIN USER
const onLoginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({
      email,
      id: user._id,
      username: user.username,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//SIGNUP USER
const onSignUpUser = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const user = await User.signup(email, password, username);
    const token = createToken(user._id);
    res.status(201).json({ id: user._id, email, username, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    // Handle image upload
    if (updates.image) {
      const uploadResponse = await cloudinary.uploader.upload(updates.image, {
        folder: "DJDB - User Images",
      });
      updates.image = uploadResponse.secure_url;
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { onLoginUser, onSignUpUser, getUserDetails, updateUser };
