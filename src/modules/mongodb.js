const { connect } = require("mongoose");

module.exports = {
  createConnection: () => connect(process.env.MONGODB_URI),
};
