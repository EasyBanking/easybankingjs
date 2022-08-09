const { Router } = require("express");
const locationRouter = require("./location");
const userRouter = require("./user");
const accountRouter = require("./account");
const adminRouter = require("./admin");
const utilsRouter = require("./utils");

const router = Router();

// locations router
locationRouter(router);

// users router
userRouter(router);

// account router
accountRouter(router);

adminRouter(router);

utilsRouter(router);

// admin router

module.exports = router;
