const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pendingSubmissionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["dj", "festival"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingSubmission", pendingSubmissionSchema);
