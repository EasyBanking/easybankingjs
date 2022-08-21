const payments = require("../controllers/payment");
const authenticate = require("../middlewares/Auth");

module.exports = (router) => {
  router.get("/admin/payment", authenticate("ADMIN"), payments.getAll);
  router.get("/admin/payment/:id", authenticate("ADMIN"), payments.getOneById);
  router.delete("/payment/delete/:id", authenticate(), payments.deletePayment);
};
