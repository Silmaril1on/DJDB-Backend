// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const createToken = (_id) => {
//   return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
// };

// // LOGIN USER
// const onLoginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.login(email, password);
//     const token = createToken(user._id);
//     res.status(200).json({
//       email,
//       id: user._id,
//       username: user.username,
//       token,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// //SIGNUP USER
// const onSignUpUser = async (req, res) => {
//   const { email, password, username } = req.body;
//   try {
//     const user = await User.signup(email, password, username);
//     const token = createToken(user._id);
//     res.status(201).json({ id: user._id, email, username, token });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
// const getUserDetails = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ msg: "User not found" });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error in getUserDetails:", error);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// // UPDATE USER
// const updateUser = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const updates = req.body;
//     const currentUser = await User.findById(userId);
//     if (!currentUser) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     if (updates.image) {
//       const uploadResponse = await cloudinary.uploader.upload(updates.image, {
//         folder: "DJDB - User Images",
//       });
//       updates.image = uploadResponse.secure_url;
//       if (currentUser.image) {
//         try {
//           const urlParts = currentUser.image.split("/");
//           const filenameWithVersion =
//             urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
//           const publicId = filenameWithVersion.split(".")[0];
//           const result = await cloudinary.uploader.destroy(publicId);
//           console.log("Cloudinary delete result:", result);

//           if (result.result !== "ok") {
//             const folderName = "DJDB - User Images";
//             const filename = urlParts[urlParts.length - 1].split(".")[0];
//             const alternativePublicId = `${folderName}/${filename}`;
//             console.log("Trying alternative public ID:", alternativePublicId);
//             await cloudinary.uploader.destroy(alternativePublicId);
//           }
//         } catch (deleteError) {
//           console.error("Error deleting old image:", deleteError);
//         }
//       }
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { $set: updates },
//       { new: true }
//     ).select("-password");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(400).json({ error: error.message });
//   }
// };

// module.exports = { onLoginUser, onSignUpUser, getUserDetails, updateUser };

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService");

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
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (updates.image) {
      const uploadResponse = await cloudinary.uploader.upload(updates.image, {
        folder: "DJDB - User Images",
      });
      updates.image = uploadResponse.secure_url;
      if (currentUser.image) {
        try {
          const urlParts = currentUser.image.split("/");
          const filenameWithVersion =
            urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
          const publicId = filenameWithVersion.split(".")[0];
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("Cloudinary delete result:", result);

          if (result.result !== "ok") {
            const folderName = "DJDB - User Images";
            const filename = urlParts[urlParts.length - 1].split(".")[0];
            const alternativePublicId = `${folderName}/${filename}`;
            console.log("Trying alternative public ID:", alternativePublicId);
            await cloudinary.uploader.destroy(alternativePublicId);
          }
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }
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

// REQUEST PASSWORD RESET
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User with this email does not exist" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with reset link
    const resetUrl = `${
      process.env.FRONTEND_URL || "https://djdb.vercel.app"
    }/resetpassword/${resetToken}`;

    const emailResult = await sendEmail(user.email, "resetPassword", {
      username: user.username,
      resetUrl,
    });

    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: "Error sending email" });
    }

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// VERIFY RESET TOKEN
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid", userId: user._id });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update password
    user.password = await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  onLoginUser,
  onSignUpUser,
  getUserDetails,
  updateUser,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
};
