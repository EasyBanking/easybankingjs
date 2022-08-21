const { Router } = require("express");
const locationRouter = require("./location");
const userRouter = require("./user");
const accountRouter = require("./account");
const adminRouter = require("./admin");
const utilsRouter = require("./utils");
const scheduleRouter = require("./schedule");
const transactionsRouter = require("./transaction");
const contactsRouter = require("./ContactUs");
const paymentsRouter = require("./payment");

const router = Router();

// locations router
locationRouter(router);

// users router
userRouter(router);

scheduleRouter(router);

transactionsRouter(router);

contactsRouter(router);

paymentsRouter(router);

// account router
accountRouter(router);

adminRouter(router);

utilsRouter(router);

// admin router

module.exports = router;
