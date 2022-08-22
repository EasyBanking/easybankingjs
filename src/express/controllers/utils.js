const questions = require("../../models/Questions.json");
const faqs = require("../../models/faqs.json");
const { Location } = require("../../models/Location");
const { Contact } = require("../../models/contact");
const { Account } = require("../../models/Account");
const { Payment } = require("../../models/Payment");
const { Schedule } = require("../../models/Schedule");
const { Transaction } = require("../../models/Transaction");
const { Urgent } = require("../../models/Urgent");

module.exports = {
  async counts(req, res) {
    const accounts = await Account.count();
    const contacts = await Contact.count();
    const locations = await Location.count();
    const payments = await Payment.count();
    const schedules = await Schedule.count();
    const transactions = await Transaction.count();
    const urgents = await Urgent.count();

    res.json({
      counters: {
        accounts,
        contacts,
        locations,
        payments,
        schedules,
        transactions,
        urgents,
      },
    });
  },
  async createContact(req, res) {
    const { message, email, subject } = req.body;

    await Contact.create({ message, email, subject });

    res.json({
      message: "thanks for reaching out!",
    });
  },
  getQuestions(req, res) {
    res.json({
      data: questions,
    });
  },

  getCsrfToken(req, res) {
    res.json(req.csrfToken());
  },

  healthCheck(req, res) {
    res.json("ok");
  },

  getFaqs(req, res) {
    res.json({
      data: faqs,
    });
  },

  async getLocations(req, res) {
    res.json({
      data: await Location.find(),
    });
  },
};
