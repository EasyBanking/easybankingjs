const payments = require("../controllers/payment");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  router.get(
    "/payment",
    // authenticate(),
    payments.getAll
  );

  router.get(
    "/payment/:id",
    // authenticate(),
    payments.getOneById
  );
  router.delete("/payment/delete/:id", authenticate(), payments.deletePayment);
};
