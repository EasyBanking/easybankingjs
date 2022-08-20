const AccountController = require("../controllers/account");
const NotficationsController = require("../controllers/notfications");
const UsersController = require("../controllers/user");
const AccountValidator = require("../validators/account");
const UserValidator = require("../validators/user");
const { celebrate } = require("celebrate");
const authenticate = require("../middlewares/Auth");
const { Multer } = require("../../modules/multer");

module.exports = (router) => {
  // accounts as a admin [read , find , update , delete ]

  router.get(
    "/admin/accounts",
    authenticate("ADMIN"),
    AccountController.getAll
  );

  router.get(
    "/admin/accounts/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.objectId),
    AccountController.find
  );

  router.delete(
    "/admin/accounts/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.objectId),
    AccountController.delete
  );

  router.patch(
    "/admin/accounts/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.update_admin),
    AccountController.alter
  );

  // notfications area

  router.get(
    "/admin/notfications",
    authenticate("ADMIN"),
    NotficationsController.getAll
  );

  router.delete(
    "/admin/notfications/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.objectId),
    NotficationsController.delete
  );

  // users area

  router.get("/admin/users", authenticate("ADMIN"), UsersController.getAll);
  
  router.get(
    "/admin/users/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.objectId),
    UsersController.findOne
  );

  router.patch(
    "/admin/users/:id",
    Multer.single("pimg"), // for upload profile img
    authenticate("ADMIN"),
    celebrate(UserValidator.update_admin),
    UsersController.update_admin
  );

  router.delete(
    "/admin/users/:id",
    authenticate("ADMIN"),
    celebrate(AccountValidator.objectId),
    UsersController.delete_admin
  );
};
