const { Transaction } = require("../../models/Transaction");
const mongoose = require("mongoose");

// module.exports = (router) =>{
module.exports = {
  async getAll(req, res) {
    try {
      const transactions = await Transaction.find().populate([
        "sender",
        "receiver",
      ]);
      res.status(200).json(transactions);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  async getTransactionByID(req, res) {
    try {
      const transaction = await Transaction.findById(req.params.id).populate([
        "sender",
        "receiver",
      ]);

      res.status(200).json(transaction);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
