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

  // activate user by email activation token
  router.get(
    "/auth/activate",
    celebrate(validator.activate),
    controller.activate
  );

  router.post("/auth/login", celebrate(validator.login), controller.login);

  // for gettin forget password token and send it to mail
  router.post(
    "/auth/forget-password",
    celebrate(validator.resetPassword),
    controller.forgetPassword
  );

  // for reset password after restore password
  router.post(
    "/auth/reset-password",
    celebrate(validator.resetPassword),
    controller.resetPassword
  );
  
};
