const { Router } = require("express");
const locationRouter = require("./location");
const TransactionRouter = require("./transaction");
const ScheduleRouter = require("./schedule");
const UserRouter = require("./user");

const router = Router();
// users router
TransactionRouter(router);

ScheduleRouter(router);

UserRouter(router);

// locations router
locationRouter(router);

module.exports = router;









