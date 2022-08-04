module.exports = {
  redis: {
    host: process.env["REDIS_HOST"],
    port: process.env["REDIS_PORT"],
    database: process.env["REDIS_DB"],
  },

  jobs: {
    DELETE_EMAIL_ACTIVATION_TOKEN: "DELETE_EMAIL_ACTIVATION_TOKEN",
    DELETE_UNACTIVATED_USER: "DELETE_UNACTIVATED_USER",
    DELETE_RESET_PAASSWORD_TOKEN: "DELETE_RESET_PAASSWORD_TOKEN",
  },
};
