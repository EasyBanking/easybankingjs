const { Router } = require("express");
const locationRouter = require("./location");
const TransactionRouter = require("./transaction");
const ScheduleRouter = require("./schedule");
const UserRouter = require("./user");
const ContactUsRouter = require("./ContactUs");
const PaymentRouter = require("./payment");
const router = Router();

// AccountRouter(router);
// users router
TransactionRouter(router);

ScheduleRouter(router);

UserRouter(router);

ContactUsRouter(router);

// locations router
locationRouter(router);

PaymentRouter(router);

module.exports = router;
