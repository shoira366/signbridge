const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller")
const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");

router.get("/", categoryController.getAllCategories)
router.post("/", authenticateUser, authorizeAdmin, categoryController.createCategory);
router.put("/:id", authenticateUser, authorizeAdmin, categoryController.updateCategory);
router.delete("/:id", authenticateUser, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;