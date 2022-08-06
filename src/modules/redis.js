const ioredis = require("ioredis");

let con = null;

const createConnection = () => {

    if(!con){
        con = new ioredis(process.env.REDISDB_URI)
    }

    return con;
};

module.exports = { createConnection };
