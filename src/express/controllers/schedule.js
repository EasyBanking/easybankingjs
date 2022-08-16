const Schedule = require('../../models/schedule');

module.exports = {

async getAll(req,res){
    try{

        console.log("the request in the schedule controller")
        const schedules =  await Schedule.find().populate('UserId','username')
        // res.status(200).json("Request Done and this is response")
        res.status(200).json(schedules)
    }
    catch(err) {
        res.status(500).json(err)
        
}  
},

async getOne(req,res){
    try{
        // const schedule = await Schedule.findById(req.params.id).populate('transaction');
         await Schedule.findById(req.params.id).populate('UserId','username').exec(function(err, schedule) {
            if(err)
            res.status(500).json(err);
            else
            res.status(200).json(schedule);
        }
         )
       
        // console.log(schedule)
        // const {TransactionId, ...others} = schedule._doc;
        //get transaction by id
        // const transaction = await Transaction.findById(TransactionId);
        
        // res.status(200).json(transaction)
    }
    catch(err){
        res.status(500).json(err)
    }
},



async allowOrigin(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

}









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

