const Schedule = require("../../models/schedule");

module.exports = {
  
  async getAll(req, res) {
    try {
      console.log("the request in the schedule controller");
      const schedules = await Schedule.find().populate("UserId", "username");
      // res.status(200).json("Request Done and this is response")
      res.status(200).json(schedules);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async getOne(req, res) {
    try {
      // const schedule = await Schedule.findById(req.params.id).populate('transaction');
      await Schedule.findById(req.params.id)
        .populate("UserId", "username")
        .exec(function (err, schedule) {
          if (err) res.status(500).json(err);
          else res.status(200).json(schedule);
        });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //Delete Schedule by id
  async deleteSchedule(req, res) {
    try {
      const id = req.params.id;
      const schedule = await Schedule.findByIdAndDelete(id);
      res.status(200).json("Schedule has been deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //get schedule by user id
  async getScheduleByUserId(req, res) {
    try {
      const userid = req.params.id;
      const schedule = await Schedule.find({ UserId: userid })
        .populate("UserId", "username")
        .limit(1);
      res.status(200).json(schedule);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async allowOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
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
