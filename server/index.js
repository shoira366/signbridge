const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = express.Router()

const authRoutes = require("./src/routes/auth.routes");
const categoryRoutes = require("./src/routes/category.routes");
const lessonRoutes = require("./src/routes/lesson.routes");
const progressRoutes = require("./src/routes/progress.routes");
const signRoutes = require("./src/routes/sign.routes")
const quizRoutes = require("./src/routes/quiz.routes")
const userRoutes = require("./src/routes/user.routes")
const achievementRoutes = require("./src/routes/achievement.routes")
const subscriptionRoutes = require("./src/routes/subscription.routes")
const notificationRoutes = require("./src/routes/notification.routes")
const adminRoutes = require("./src/routes/admin.routes")

const subscriptionController = require("./src/controllers/subscription.controller")

const app = express();

app.use(cors());

// Webhook (no auth, must be raw body)
app.post(
  "/api/subscriptions/stripe-webhook",
  express.raw({ type: 'application/json' }),
  subscriptionController.handleStripeWebhook
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "SignBridge API is running" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/signs", signRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes)
app.use("/api/achievements", achievementRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});