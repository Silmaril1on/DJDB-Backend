const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getPendingSubmissions,
  createPendingSubmission,
  handleSubmission,
} = require("../controllers/pendingSubmissionControllers");

const router = express.Router();

// Require authentication for all routes
router.use(requireAuth);
router.get("/", getPendingSubmissions);
router.post("/", createPendingSubmission);
router.post("/:id/handle", handleSubmission);

module.exports = router;
