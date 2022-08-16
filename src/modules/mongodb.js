const { connect } = require("mongoose");

module.exports = {
  createConnection: () => {
    connect("mongodb://localhost:27017/easybanking");
    console.log("Connected to mongodb")
  },
};
