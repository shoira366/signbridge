const { PrismaClient } = require("@prisma/client");
const { uploadBufferToR2 } = require("../services/storage.service");

const prisma = new PrismaClient();

const createSign = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { word, meaningUz, description, order, videoUrl } = req.body;

    if (!lessonId || !word || !meaningUz) {
      return res.status(400).json({
        message: "lessonId, word, and meaningUz are required",
      });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    let imageUrl = null;

    if (req.file) {
      const uploaded = await uploadBufferToR2(req.file, "signs");
      imageUrl = uploaded.url;
    }

    const sign = await prisma.sign.create({
      data: {
        lessonId,
        word,
        meaningUz,
        description: description || null,
        order: order ? Number(order) : null,
        videoUrl: videoUrl || null,
        imageUrl,
      },
    });

    return res.status(201).json(sign);
  } catch (error) {
    console.error("Create sign error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A sign with this word already exists in this lesson",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSignsByLesson = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);

    const signs = await prisma.sign.findMany({
      where: { lessonId },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    return res.json(signs);
  } catch (error) {
    console.error("Get signs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSign = async (req, res) => {
  try {
    const signId = Number(req.params.id);
    const { word, meaningUz, description, order, videoUrl } = req.body;

    if (Number.isNaN(signId)) {
      return res.status(400).json({ message: "Invalid sign id" });
    }

    const existingSign = await prisma.sign.findUnique({
      where: { id: signId },
    });

    if (!existingSign) {
      return res.status(404).json({ message: "Sign not found" });
    }

    if (!word?.trim() || !meaningUz?.trim()) {
      return res.status(400).json({
        message: "word and meaningUz are required",
      });
    }

    let imageUrl = existingSign.imageUrl;

    // If a new image is uploaded, replace stored imageUrl
    if (req.file) {
      const uploaded = await uploadBufferToR2(req.file, "signs");
      imageUrl = uploaded.url;
    }

    const updatedSign = await prisma.sign.update({
      where: { id: signId },
      data: {
        word: word.trim(),
        meaningUz: meaningUz.trim(),
        description: description?.trim() || null,
        order: order !== undefined && order !== "" ? Number(order) : null,
        videoUrl: videoUrl?.trim() || null,
        imageUrl,
      },
    });

    return res.json(updatedSign);
  } catch (error) {
    console.error("Update sign error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A sign with this word already exists in this lesson",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSign = async (req, res) => {
  try {
    const signId = Number(req.params.id);

    if (Number.isNaN(signId)) {
      return res.status(400).json({ message: "Invalid sign id" });
    }

    await prisma.sign.delete({
      where: { id: signId },
    });

    return res.json({ message: "Sign deleted successfully" });
  } catch (error) {
    console.error("Delete sign error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSign,
  getSignsByLesson,
  updateSign,
  deleteSign
};