const PendingSubmission = require("../models/pendingSubmissionModel");
const Artist = require("../models/artistsModel");
const Festival = require("../models/festivalModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
const { sendEmail } = require("../utils/emailService");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all pending submissions
const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await PendingSubmission.find({ status: "pending" })
      .populate("submittedBy", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a pending submission
const createPendingSubmission = async (req, res) => {
  try {
    const { type, data } = req.body;
    const submittedBy = req.user._id;
    let processedData = { ...data };
    if (type === "dj" && data.image) {
      const mainImageResult = await cloudinary.uploader.upload(data.image, {
        folder: "DJDB - Artist Images",
      });
      processedData.image = mainImageResult.secure_url;
      if (data.gallery && data.gallery.length > 0) {
        const galleryUrls = await Promise.all(
          data.gallery.map(async (img) => {
            const result = await cloudinary.uploader.upload(img, {
              folder: "DJDB - Artist Gallery",
            });
            return result.secure_url;
          })
        );
        processedData.gallery = galleryUrls;
      }
    } else if (type === "festival" && data.image) {
      const festivalPosterResult = await cloudinary.uploader.upload(
        data.image,
        {
          folder: "DJDB - Festival Posters",
        }
      );
      processedData.image = festivalPosterResult.secure_url;
    }
    const submission = await PendingSubmission.create({
      type,
      data: processedData,
      submittedBy,
    });
    res.status(201).json(submission);
  } catch (error) {
    console.error("Error in createPendingSubmission:", error);
    res.status(400).json({ error: error.message });
  }
};

// Handle submission approval/decline
const handleSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const submission = await PendingSubmission.findById(id).populate(
      "submittedBy",
      "username email"
    );
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    const user = await User.findById(submission.submittedBy._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const submissionName = submission.data.stageName || submission.data.name;
    if (action === "approve") {
      if (submission.type === "dj") {
        await Artist.create(submission.data);
      } else if (submission.type === "festival") {
        await Festival.create(submission.data);
      }
      await sendEmail(user.email, "approved", {
        username: user.username,
        artistName: submissionName,
      });
      await PendingSubmission.findByIdAndDelete(id);
      res.status(200).json({
        message: "Submission approved and added to database successfully",
        success: true,
        emailSent: true,
      });
    } else if (action === "decline") {
      await sendEmail(user.email, "declined", {
        username: user.username,
        artistName: submissionName,
      });
      await PendingSubmission.findByIdAndDelete(id);
      res.status(200).json({
        message: "Submission declined",
        success: true,
        emailSent: true,
      });
    } else {
      res
        .status(400)
        .json({ error: "Invalid action. Use 'approve' or 'decline'." });
    }
  } catch (error) {
    console.error("Error handling submission:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPendingSubmissions,
  createPendingSubmission,
  handleSubmission,
};
