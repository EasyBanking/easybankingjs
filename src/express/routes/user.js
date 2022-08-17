const controller = require("../controllers/user");
const validator = require("../validators/user");
const { celebrate } = require("celebrate");
const { Multer } = require("../../modules/multer");
const authenticate = require("../middlewares/Auth");

// locations resource router

module.exports = (router) => {
  router.post(
    "/auth/register",
    Multer.single("pimg"), // for upload profile img
    celebrate(validator.register, { allowUnknown: true }),
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
    "/auth/reset-password/:token",
    celebrate(validator.changePassword),
    controller.resetPassword
  );

  router.post(
    "/auth/update",
    Multer.single("pimg"), // for upload profile img
    authenticate(),
    celebrate(validator.update),
    controller.updateUser
  );

  router.post(
    "/auth/delete",
    authenticate(),
    celebrate(validator.disableAndDelete),
    controller.delete
  );

  router.post(
    "/auth/disable",
    authenticate(),
    celebrate(validator.disableAndDelete),
    controller.disable
  );

  // auth checkme
  router.get("/auth/checkme", authenticate(), controller.checkMe);

  router.get(
    "/user/search",
    authenticate(),
    celebrate(validator.search),
    controller.search
  );
};
