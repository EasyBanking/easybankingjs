const controller = require("../controllers/transaction");
//const authenticate = require("../middlewares/Auth");

// locations resource router

module.exports = (router) => {
  router.get("/transactions", controller.allowOrigin, controller.getAll);
  console.log("the request is in the transaction routes");

  //get transaction by id
  router.get(
    "/transactions/:id",
    controller.allowOrigin,
    controller.getTransactionByID
  );

  router.get(
    "/transaction/stats/:id",
    controller.allowOrigin,
    controller.stats
  );
};
