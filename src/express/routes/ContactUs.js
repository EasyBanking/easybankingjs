const controller = require("../controllers/contactus");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  //get all contactus requests
  router.get("/admin/contactus", authenticate(), controller.getAll);
  router.get("admin/contactus/:id", authenticate(), controller.getOneById);

  //delete contactus request by id
  router.delete(
    "/admin/contactus/delete/:id",
    authenticate(),
    controller.deleteContactUs
  );
};
