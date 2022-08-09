module.exports = {
  redis: {
    host: process.env["REDIS_HOST"],
    port: process.env["REDIS_PORT"],
    database: process.env["REDIS_DB"],
    password: process.env["REDIS_PASSWORD"],
    user: process.env["REDIS_USER"],
  },

  jobs: {
    DELETE_EMAIL_ACTIVATION_TOKEN: "DELETE_EMAIL_ACTIVATION_TOKEN",
    DELETE_UNACTIVATED_USER: "DELETE_UNACTIVATED_USER",
    DELETE_RESET_PAASSWORD_TOKEN: "DELETE_RESET_PAASSWORD_TOKEN",
  },

  events: {
    TRANSFER_MONEY_NOTFICATION: "TRANSFER_MONEY_NOTFICATION",
    INSTANT_PAY_GENERATION_NOTFICATION: "INSTANT_PAY_GENERATION_NOTFICATION",
    RECEIVE_MONEY_NOTFICATION: "RECEIVE_MONEY_NOTFICATION",
    NOTFICATION: "NOTFICATION",
    INSTANT_PAY_RECEVEING_NOTFICATION: "INSTANT_PAY_RECEVEING_NOTFICATION",
  },
};
