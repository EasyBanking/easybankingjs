const { User } = require("../../models/User");
const { Token } = require("../../models/Tokens");
const { BadRequest, InternalServerError } = require("http-errors");
const sharp = require("sharp");
const path = require("path");
const { AppQueue } = require("../../jobs/app");
const { jobs } = require("../../helpers/constants");
const { mailer } = require("../../modules/mailer");
const { randomBytes } = require("crypto");
const { existsSync, unlinkSync } = require("fs");
const mongodb = require("mongoose");

module.exports = {
  async register(req, res) {
    const { username, email, password, question, answear } = req.body;

    let imgPath_;

    let session = await mongodb.startSession();
    session.startTransaction();

    const ids = {
      user: -1,
      token: -1,
    };

    try {
      // if username or email existed
      const isExist = await FilterUser({ username, email });

      if (isExist) {
        let existMsg = " is exist try another one";
        throw new BadRequest(
          `${
            isExist.username === username
              ? `username` + existMsg
              : "email" + existMsg
          }`
        );
      }

      // handle profile image
      const imgPath = (username) =>
        path.join("uploads", "images", `img-${username}-${Date.now()}.webp`);

      // saving user

      const usr = new User({
        username,
        email,
        password,
        security: {
          question: question,
          answer: answear,
        },
      });

      const token = new Token({
        userId: usr._id,
        token: randomBytes(16).toString("hex"),
        expireAt: Date.now() + 86400000, // expire after 24 hours
        type: "emailConfirmation",
      });

      // send a message to user to opens his mail and activate it
      imgPath_ = imgPath(usr.username);

      await sharp(req.file.buffer)
        .resize(150, 150)
        .toFormat("webp")
        .toFile(imgPath_);

      usr.profileImg = imgPath_;

      // sending an activation email to the user

      ids["user"] = usr._id;
      ids["token"] = token._id;

      // await sendActivationMail(token.token, usr.email);
      await token.save();
      await usr.save();

      // adding a job to delete tokens after expire [after 24 housr]
      const deleteActionTokenJob = AppQueue.add(
        jobs.DELETE_EMAIL_ACTIVATION_TOKEN,
        { token },
        { delay: 86400000 }
      );

      const deleteAccountJob = AppQueue.add(
        jobs.DELETE_UNACTIVATED_USER,
        { usr },
        { delay: 86400000 } // DLETE USER IF NOT ACTIVATE ACCOUNT AFTER 24 HOUR
      );

      await session.commitTransaction();

    } catch (err) {
      console.log(err);

      await session.abortTransaction();

      const usr = await User.findById(ids["user"] ).orFail();

      await usr.deleteOne();

      await Token.deleteOne({ _id: ids["token"] });

      throw err;
    } finally {
      await session.endSession();
    }

    res.json({
      message:
        "acitivation link sent to your email , ! link expires after 24 hours",
    });
  },
};

// service here

const FilterUser = (query) => {
  return User.findOne({
    $and: [query],
  });
};

const sendActivationMail = async (token, email) => {
  await mailer.send({
    from: process.env["APP_EMAIL"],
    to: email,
    subject: "Activate your account",
    text: "get the full functionality by activate your account",
    html: `<p>Hello,</p>
  <p>Please click on the following link to activate your account:</p>
  <p><a href="${process.env["APP_URL"]}/api/auth/activate/${token}">${process.env["APP_URL"]}/api/auth/activate/${token}</a></p>
  <p>If you did not request this, please ignore this email.</p>
  <p>this link will expire after 24 hours</p>
  <p>Thanks,</p>
  <p>${process.env["APP_NAME"]}</p>`,
  });
};
