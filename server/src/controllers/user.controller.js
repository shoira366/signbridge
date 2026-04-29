const prisma = require("../config/prisma.config");
const bcrypt = require("bcrypt");

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// PUT /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        email,
      },
    });

    res.json({
      message: "Profile updated",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to update profile" });
  }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashed,
      },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// DELETE /api/users/reset-progress
exports.resetProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.$transaction([
      prisma.userProgress.deleteMany({
        where: { userId },
      }),
      prisma.quizAttempt.deleteMany({
        where: { userId },
      }),
    ]);

    res.json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset progress" });
  }
};