const controller = require("../controllers/schedule");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  router.get("/schedule", authenticate("ADMIN"), controller.getAll);

  router.get(
    "/schedule/:id",
    authenticate("ADMIN"),
    controller.getOne
  );

  //get schedule by User Id route
  router.get(
    "/schedule/user/:id",
    authenticate("ADMIN"),
    controller.getScheduleByUserId
  );
  // Delete Schedule by id
  router.delete(
    "/schedule/delete/:id",
    authenticate("ADMIN"),
    controller.deleteSchedule
  );
};
