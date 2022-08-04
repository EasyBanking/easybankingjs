const controller = require("../controllers/user");
const validator = require("../validators/user");
const { celebrate } = require("celebrate");
const { Multer } = require("../../modules/multer");

// locations resource router

module.exports = (router) => {
  router.post(
    "/auth/register",
    Multer.single("pimg"), // for upload profile img
    celebrate(validator.register),
    controller.register
  );
};
