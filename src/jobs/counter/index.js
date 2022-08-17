const mongodb = require("mongoose");
const { EventEmitter } = require("events");
const { logger } = require("../../modules/logger");
const { createConnection } = require("../../modules/redis");
const { Account } = require("../../models/Account");
const { Schedule } = require("../../models/Schedule");
const con = createConnection();
const COUNTER_KEY_REDIS = "counter";

const objectId = (id) => new mongodb.Types.ObjectId(id);

const emiter = new EventEmitter();

emiter.on("counter.inc", async (location_id, timestamp, type, accountId) => {
  logger.info("subscribe increment");

  const counter = JSON.parse(await con.get(COUNTER_KEY_REDIS));

  let state = parseInt(counter["locations"]?.[location_id]?.[timestamp] || 0);

  state++;

  counter["locations"] = {
    [location_id]: {
      [timestamp]: state,
    },
  };

  con.set(COUNTER_KEY_REDIS, JSON.stringify(counter));

  const scd = await Schedule.create({
    date: timestamp,
    priority: state,
    type,
    location_id: objectId(location_id),
  });

  const acc = await Account.findOneAndUpdate(
    {
      _id: objectId(accountId),
    },
    {
      $push: {
        schedules: scd._id,
      },
    }
  );
});

emiter.on(
  "counter.dec",
  async (location_id, timestamp, account_id, schedule_id) => {
    try {
      await Account.findOneAndUpdate(
        {
          _id: objectId(account_id),
        },
        {
          $pull: {
            schedules: schedule_id,
          },
        }
      );

      await Schedule.findOneAndDelete({
        _id: objectId(schedule_id),
      });

      logger.info("subscribe decrement");

      const counter = JSON.parse(await con.get(COUNTER_KEY_REDIS));

      let state = parseInt(
        counter["locations"]?.[location_id]?.[timestamp] || 0
      );

      if (state > 0) {
        state--;

        counter["locations"] = {
          [location_id]: {
            [timestamp]: state,
          },
        };

        con.set(COUNTER_KEY_REDIS, JSON.stringify(counter));
      }
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = emiter;
