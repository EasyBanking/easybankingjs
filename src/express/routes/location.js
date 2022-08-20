const controller = require("../controllers/location");
const validator = require("../validators/location");
const { celebrate } = require("celebrate");
const authenticate = require("../middlewares/Auth");

// locations resource router

module.exports = (router) => {
  router.get("/location", controller.getAll);

  router.get(
    "/location/search",
    authenticate(),
    celebrate(validator.search),
    controller.search
  );

  router.get(
    "/location/nearest",
    authenticate(),
    celebrate(validator.findNearest),
    controller.findNearest
  );
};
