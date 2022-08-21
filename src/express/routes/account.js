const controller = require("../controllers/account");
//const validator = require("../validators/account");
const { celebrate } = require("celebrate");
const authenticate = require("../middlewares/Auth");

// locations resource router

module.exports = (router) => {
  router.post(
    "/account/create",
    authenticate(),
    celebrate(validator.createAccount),
    controller.createAccount
  );

  router.post(
    "/account/transfer",
    authenticate(),
    celebrate(validator.transferMoney),
    controller.transferMoney
  );

  router.post(
    "/account/update",
    authenticate(),
    celebrate(validator.updateAccount),
    controller.updateAccount
  );

  router.get(
    "/account/search",
    authenticate(),
    celebrate(validator.search),
    controller.accountSearch
  );

  router.post(
    "/account/pay",
    authenticate(),
    celebrate(validator.pay),
    controller.pay
  );

  router.post(
    "/account/read-pay/:token",
    authenticate(),
    celebrate(validator.readPayment),
    controller.readPayment
  );

  router.get(
    "/account/find",
    authenticate(),
    celebrate(validator.find),
    controller.findOne
  );

  router.get(
    "/account/transactions",
    authenticate(),
    celebrate(validator.Transactions),
    controller.transactions
  );

  router.post(
    "/account/schedule",
    authenticate(),
    celebrate(validator.createSchedule),
    controller.createSchedule
  );

  router.delete(
    "/account/schedule",
    authenticate(),
    celebrate(validator.deleteSchedule),
    controller.deleteSchedule
  );
};
