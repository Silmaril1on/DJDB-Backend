const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();
const {
  onLoginUser,
  onSignUpUser,
  getUserDetails,
  updateUser,
} = require("../controllers/userControllers");

router.post("/login", onLoginUser);
router.post("/signup", onSignUpUser);
router.get("/details", requireAuth, getUserDetails);
router.put("/update", requireAuth, updateUser);

module.exports = router;
