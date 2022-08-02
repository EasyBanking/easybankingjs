const { Router } = require("express");
const locationRouter = require("./location");

const router = Router();

// locations router
locationRouter(router);

module.exports = router;
