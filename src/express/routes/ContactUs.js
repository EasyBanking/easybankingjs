const controller = require("../controllers/contactus");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  
  router.get("/admin/contact/:id",authenticate("ADMIN"),controller.getOneById);
  
  //get all contactus requests
  router.get("/admin/contact", authenticate("ADMIN"), controller.getAll);

  //delete contactus request by id
  router.delete(
    "/admin/contact/delete/:id",
    authenticate("ADMIN"),
    controller.deleteContactUs
  );
};
