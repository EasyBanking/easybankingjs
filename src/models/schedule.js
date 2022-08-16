const mongoose = require("mongoose");
const ScheduleSchema = new mongoose.Schema(
  {
    UserId : {
      type: mongoose.Schema.Types.ObjectId , ref : 'User',
      required:true
    },
    Location: {
      type:String,
      required: true,
    },
    Datetime: {
      type: Date,
      required: true,
      //GET Day
      default: Date,
    },
    Priority:{
        //number
        type:String,
        required: true,
    },
   
  },
  { versionKey: false }
);

const Schedule = mongoose.model('schedule', ScheduleSchema);

module.exports = Schedule;


















// const mongoose = require("mongoose");

// const ScheduleSchema = new mongoose.Schema(
//   {
//     UserId : {
//       type: String,
//       required:true
//     },
//     Location: {
//       type: String,
//       required: true,
//     },
//     Datetime: {
//       type: Date,
//       required: true,
//       //GET Day
//       default: Date,
//     },
//     Priority:{
//         //number
//         type:String,
//         required: true,
//     }
//   },
//   { versionKey: false }
// );

// const Schedule = mongoose.model('schedule', ScheduleSchema);

// module.exports = Schedule;
