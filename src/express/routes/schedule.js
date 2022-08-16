const controller = require("../controllers/schedule");


module.exports = (router) => {

  router.get("/schedule",controller.allowOrigin, controller.getAll);

  router.get("/schedule/:id",controller.allowOrigin, controller.getOne);

}




