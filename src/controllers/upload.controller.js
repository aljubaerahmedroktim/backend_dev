const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      filename: req.file.filename,
      originalName: req.file.originalName,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
  });
};

module.exports = { uploadImage };
