const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.get("/me", authenticateUser, userController.getMe);

router.put("/me", authenticateUser, userController.updateProfile);

router.put(
  "/change-password",
  authenticateUser,
  userController.changePassword
);

router.delete(
  "/reset-progress",
  authenticateUser,
  userController.resetProgress
);

module.exports = router;