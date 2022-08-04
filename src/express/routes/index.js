const { Router } = require("express");
const locationRouter = require("./location");
const userRouter = require("./user");

const router = Router();

// locations router
locationRouter(router);

// users router
userRouter(router);

module.exports = router;
