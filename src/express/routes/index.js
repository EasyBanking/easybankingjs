const { Router } = require("express");
const locationRouter = require("./location");
const userRouter = require("./user");
const accountRouter = require("./account");

const router = Router();

// locations router
locationRouter(router);

// users router
userRouter(router);

// account router
accountRouter(router);

module.exports = router;
