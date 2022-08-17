const { connect, Mongoose } = require("mongoose");

let con;

/**
 *
 * @returns {Mongoose}
 */
module.exports = () => {
  if (!con) {
    con = connect(process.env.MONGODB_URI,{
      dbName:process.env.MONGODB_NAME
    });
  }

  return con;
};
