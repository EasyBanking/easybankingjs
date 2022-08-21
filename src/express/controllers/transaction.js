const Transaction = require("../../models/transaction");
const mongoose = require("mongoose");

// module.exports = (router) =>{
module.exports = {
  //GET All Transactions  !! Note : "Add" Admin Authorization
  async stats(req, res) {
    const id = req.params.id;
    try {
      //get the most recevier from the user with id
      const top_3_Receivers = await Transaction.aggregate([
        {
          $match: { SenderId: mongoose.Types.ObjectId(id) },
        },
        {
          $group: { _id: "$ReceiverId", count: { $sum: 1 } },
        },
        {
          $sort: { count: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            "user.username": 1,
          },
        },
      ]).limit(3);

      const top_3_Senders = await Transaction.aggregate([
        {
          $match: { ReceiverId: mongoose.Types.ObjectId(id) },
        },
        {
          $group: { _id: "$SenderId", count: { $sum: 1 } },
        },
        {
          $sort: { count: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            "user.username": 1,
          },
        },
      ]).limit(3);

      res.status(200).json({
        "TOP Senders": top_3_Senders,
        "TOP Receivers": top_3_Receivers,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async getAll(req, res) {
    try {
      console.log("the request is in the controller");
      const transactions = await Transaction.find()
        .populate("SenderId", "username")
        .populate("ReceiverId", "username");
      // console.log(transactions);
      res.status(200).json(transactions);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  async getTransactionByID(req, res) {
    try {
      const transaction = await Transaction.findById(req.params.id)
        .populate("ReceiverId", "username")
        .populate("SenderId", "username");
      res.status(200).json(transaction);
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
