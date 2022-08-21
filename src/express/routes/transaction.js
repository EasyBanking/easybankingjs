const controller = require("../controllers/transaction");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  router.get("/transactions", authenticate("ADMIN"), controller.getAll);

  //get transaction by id
  router.get(
    "/transactions/:id",
    authenticate("ADMIN"),
    controller.getTransactionByID
  );
};
