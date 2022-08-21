const { Payment } = require("../../models/Payment");

module.exports = {
  async getAll(req, res) {
    try {
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async getOneById(req, res) {
    try {
      const id = req.params.id;
      const payment = await Payment.findById(id);
      res.status(200).json(payment);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async deletePayment(req, res) {
    try {
      const id = req.params.id;
      const payment = await Payment.findByIdAndDelete(id);
      res.status(200).json(payment);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
