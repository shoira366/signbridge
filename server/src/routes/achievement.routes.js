// server/src/routes/achievement.routes.js
const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");
const achievementController = require("../controllers/achievement.controller");

router.get("/me", authenticateUser, achievementController.getUserAchievements);
router.post("/check", authenticateUser, achievementController.checkAndUnlockAchievements);
router.get("/leaderboard", authenticateUser, achievementController.getLeaderboard);

module.exports = router;