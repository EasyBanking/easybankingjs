const Transaction = require('../../models/transaction');

// module.exports = (router) =>{
module.exports = {
//GET All Transactions  !! Note : "Add" Admin Authorization

  async getAll(req, res){
    try{
    console.log("the request is in the controller");
    const transactions = await Transaction.find().populate('SenderId','username').populate('ReceiverId','username');  
    // console.log(transactions);
    res.status(200).json(transactions)
    }
    catch(err){
      res.status(500).json(err)
    }


  
 
},
   async getTransactionByID(req, res){
      try{  
      const transaction = await Transaction.findById(req.params.id).populate('ReceiverId','username').populate('SenderId','username');
      res.status(200).json(transaction)
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

// async getAll(req, res) {
//     const locations = await Location.find();

//     res.json({
//       data: locations,
//     });
//   },

//}

//   const getoneStatus = async (req, res) => { 
//     try{
//         const transaction  = await Transaction.findById(req.params.id);
//         //Get Transaction Status
//         const {TransactionStatus,...others} = transaction._doc;
//          res.json(TransactionStatus);
//     }
//     catch(err){
//         res.status(500).json({
//             message: err.message,
//         });
//     }
//   }
  







// // find by transaction id   "add User or Admin Authorization"
// const getOneById = async (req, res) => {
//     const id = req.params.id;
//     try{
//     const transaction = await Transaction.findById(id);
//     res.status(200).json({transaction})
//     }
//     catch(err){
//         res.status(500).json({
//             message: err.message,
//         });
//     }
// }

// //Get Transaction By Type "add User or Admin Authorization"

// const getByType = async (req, res) => {
//     const {type} = req.query;
//     try{
//     const transactions = await Transaction.find({type});
//     res.json({
//       data: transactions,
//     });}
//     catch(err){
//         res.status(500).json({
//             message: err.message,
//         });
//     }
//   }

//   module.exports = async (req, res) => {
//     const {status,id} = req.query;
//     const transactions = await Transaction.find({id,status});
//     res.json({
//         data: transactions,
//     });
// }


// //get transactions by receiver
// const GetTransactionByReciver = async (req, res) => {
//     const {receiver} = req.query;
//     const transactions = await Transaction.find({ReceiverID:receiver});
//     res.json({
//         data: transactions,
//     });
// }



//}