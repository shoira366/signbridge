// server/src/routes/subscription.routes.js
const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const subscriptionController = require("../controllers/subscription.controller");

router.get("/me", authenticateUser, subscriptionController.getMySubscription);
router.post("/create-checkout-session", authenticateUser, subscriptionController.createCheckoutSession);
router.post("/cancel", authenticateUser, subscriptionController.cancelSubscription);
router.get("/check/:lessonId", authenticateUser, subscriptionController.checkPremiumAccess);
router.get("/pending-change", authenticateUser, subscriptionController.getPendingPlanChange);

module.exports = router;