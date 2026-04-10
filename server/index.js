const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const categoryRoutes = require("./src/routes/category.routes");
const lessonRoutes = require("./src/routes/lesson.routes");
const progressRoutes = require("./src/routes/progress.routes");
const signRoutes = require("./src/routes/sign.routes")
const quizRoutes = require("./src/routes/quiz.routes")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "SignBridge API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/signs", signRoutes);
app.use("/api/quizzes", quizRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});