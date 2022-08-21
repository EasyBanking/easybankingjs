const { Schedule } = require("../../models/Schedule");
const { Account } = require("../../models/Account");
const objectId = (id) => new mongodb.Types.ObjectId(id);
const mongodb = require("mongoose");

module.exports = {
  async getAll(req, res) {
    try {
      const schedules = await Account.find()
        .populate("schedules")
        .select(["schedules", "firstName", "lastName", "_id"]);

      res.status(200).json(schedules);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async getOne(req, res) {
    try {
      // const schedule = await Schedule.findById(req.params.id).populate('transaction');
      const schedule = await Account.findOne({
        schedules: objectId(req.params.id),
      })
        .populate("schedules")
        .select(["schedules", "firstName", "lastName", "_id"]);

      /*Schedule.findById(req.params.id)
        .populate("UserId", "username")
        .exec(function (err, schedule) {
          if (err) res.status(500).json(err);
          else res.status(200).json(schedule);
        });*/

      res.json(schedule);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //Delete Schedule by id
  async deleteSchedule(req, res) {
    try {
      const id = req.params.id;
      const schedule = await Schedule.findByIdAndDelete(id);
      const usr = await Account.findOneAndUpdate(
        {
          $where: {
            "schedules._id": objectId(id),
          },
        },
        {
          $pull: {
            schedules: {
              $in: [objectId(id)],
            },
          },
        }
      );
      res.status(200).json("Schedule has been deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //get schedule by user id
  async getScheduleByUserId(req, res) {
    try {
      const accountId = req.params.id;
      const schedule = await Account.findOne({
        _id: objectId(accountId),
      })
        .populate(["schedules"])
        .select(["_id", "schedules", "firstName", "lastName"]);
      res.status(200).json(schedule);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

// const Schedule = require('../models/schedule');

// module.exports = {

// async getAll(req,res){
//     try{

//         console.log("the request in the schedule controller")
//         const schedules =  await Schedule.find();
//         // res.status(200).json("Request Done and this is response")
//         res.status(200).json(schedules)
//     }
//     catch(err) {
//         res.status(500).json(err)

// }
// },

// async allowOrigin(req, res, next) {
//   res.header('Access-Control-Allow-Origin', "*");
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// }

// }
