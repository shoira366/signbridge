// const express = require("express");
// const router = express.Router();
// const prisma = require("../config/prisma.config");
// const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");

// router.post("/", authenticateUser, authorizeAdmin, async (req, res) => {
//   const { lessonId, word, meaningUz } = req.body;

//   const sign = await prisma.sign.create({
//     data: {
//       lessonId,
//       word,
//       meaningUz,
//     },
//   });

//   res.json(sign);
// });

// router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
//   await prisma.sign.delete({
//     where: { id: Number(req.params.id) },
//   });

//   res.json({ message: "Deleted" });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createSign,
  getSignsByLesson,
  updateSign, 
  deleteSign,
  getCompletedSigns
} = require("../controllers/sign.controller");
const { upload } = require("../middlewares/upload.middleware");
const { authenticateUser } = require("../middlewares/auth.middleware")

router.post("/lessons/:lessonId/", upload.single("image"), createSign);
router.get("/lessons/:lessonId/signs", getSignsByLesson);
router.put("/:id", upload.single("image"), updateSign);
router.delete("/signs/:id", deleteSign);
router.get("/lesson/:lessonId/completed-signs", authenticateUser, getCompletedSigns);

module.exports = router;