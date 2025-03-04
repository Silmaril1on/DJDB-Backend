const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();
const {
  onLoginUser,
  onSignUpUser,
  getUserDetails,
  updateUser,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} = require("../controllers/userControllers");

router.post("/login", onLoginUser);
router.post("/signup", onSignUpUser);
router.get("/details", requireAuth, getUserDetails);
router.put("/update", requireAuth, updateUser);
router.post("/request-password-reset", requestPasswordReset);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
