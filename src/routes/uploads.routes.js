const express = require("express");

const upload = require("../middleware/upload.middleware.js");

const { uploadImage } = require("../controllers/upload.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/image", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;
