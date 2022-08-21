const controller = require("../controllers/user");

module.exports = (router) => {
  router.get("/admin/users", controller.getAll);
  router.get("/admin/users/:id", controller.getOneById);
};
