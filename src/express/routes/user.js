const controller = require("../controllers/user");


module.exports = (router) => {

  router.get("/admin/users", controller.getAll);
   console.log("the request is in the user routes");

}




