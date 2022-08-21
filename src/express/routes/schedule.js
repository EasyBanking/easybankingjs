const controller = require("../controllers/schedule");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  router.get(
    "/schedule",
    //controller.allowOrigin,
    //authenticate(),
    controller.getAll
  );

  router.get(
    "/schedule/:id",
    controller.allowOrigin,
    //authenticate(),
    controller.getOne
  );

  //get schedule by User Id route
  router.get(
    "/schedule/user/:id",
    controller.allowOrigin,
    //authenticate(),
    controller.getScheduleByUserId
  );
  // Delete Schedule by id
  router.delete(
    "/schedule/delete/:id",
    controller.allowOrigin,
    //authenticate(),
    controller.deleteSchedule
  );
};
