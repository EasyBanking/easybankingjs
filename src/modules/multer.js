const multer = require("multer");
const isDev = process.env.NODE_ENV === "development";
const { BadRequest } = require("http-errors");

const filterImages = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new BadRequest("Only images are allowed!"));
  }
};

const Multer = multer({
  limits: {
    fileSize: 400000, // 400kb
    //fieldSize: 400000, // 400kb allowed for the request
    files: 1, // 1 file allowed in request,
  },
  storage: isDev ? multer.memoryStorage() : null,
  fileFilter: filterImages,
});

module.exports = { Multer };
