const { User } = require("../../models/User");
const { Token } = require("../../models/Tokens");
const { BadRequest, NotFound, Unauthorized } = require("http-errors");
const sharp = require("sharp");
const path = require("path");
const { AppQueue } = require("../../jobs/app");
const { jobs } = require("../../helpers/constants");
const { mailer } = require("../../modules/mailer");
const { randomBytes } = require("crypto");
const mongodb = require("mongoose");
const jsonwebtoken = require("jsonwebtoken");
const { compareSync } = require("bcryptjs");
const { unlinkSync } = require("fs");
const { join } = require("path");

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

      await sendActivationMail(token.token, usr.email);
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

      await session.abortTransaction();

      const usr = await User.findById(ids["user"]).orFail();

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

  async activate(req, res) {
    const { token } = req.params;

    try {
      const token_ = await Token.findOne({ token });

      const isExpired = token_?.["expireAt"] < Date.now();

      if (!token_ || isExpired) {
        throw new Error("Invalid token or maybe expired try another one !");
      }

      const user = await User.findByIdAndUpdate(token_?.["userId"], {
        isAcitive: true,
      });

      if (!user) {
        throw new Error("Invalid activation token");
      }

      await token_.remove();
    } catch (err) {
      throw new BadRequest("Invalid token or maybe expired try another one !");
    }

    res.json({
      message: "User activated successfully",
    });
  },

  async login(req, res) {
    const { username, password, remember } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      throw new BadRequest("Invalid username or password");
    }

    if (!compareSync(password, user?.["password"])) {
      throw new BadRequest("Invalid username or password");
    }

    if (!user?.["isAcitive"]) {
      throw new BadRequest("User is not activated");
    }

    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env["JWT_SECRET"],
      {
        expiresIn: remember ? "7d" : "1h",
      }
    );

    res.json({
      message: "User logged in successfully",
      token,
    });
  },

  async forgetPassword(req, res) {
    const { question, answear, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequest("Invalid email");
    }

    if (
      user?.["security"]?.["question"] != question ||
      user?.["security"]?.["answer"] != answear
    ) {
      throw new BadRequest("Invalid security question or answer");
    }

    const token = randomBytes(16).toString("hex");

    const token_ = await Token.create({
      userId: user._id,
      token,
      expireAt: Date.now() + 86400000, // expire after 24 hours
      type: "passwordReset",
    });

    await sendPasswordResetToken(token, user.email);

    AppQueue.add(
      jobs.DELETE_RESET_PAASSWORD_TOKEN,
      { id: token_._id },
      { delay: 86400000 } // DELETE RESET PASSWORD TOKEN AFTER 24 HOURS
    );

    res.json({
      message:
        "Password reset link sent to your email, ! link expires after 24 hours",
    });
  },

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const token_ = await Token.findOne({ token });

      if (!token_) {
        throw new BadRequest("Invalid token");
      }

      const isExpired = token_?.["expireAt"] < Date.now();

      if (isExpired) {
        throw new BadRequest(
          "Invalid token or maybe expired try another one !"
        );
      }

      const user = await User.findById(token_?.["userId"]);

      if (!user) {
        throw new BadRequest("Invalid token");
      }

      user.password = password;

      await user.save();

      await token_.remove();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    res.json({
      message: "Password reseted successfully",
    });
  },

  async updateUser(req, res) {
    const { username, email, password, question, answear } = req.body;

    let imgPath_;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const usr = await User.findOne({
        _id: req.user._id,
      });

      const isExist = await User.findOne({
        username,
        email,
        _id: {
          $ne: req.user._id,
        },
      });

      if (isExist) {
        const msg = isExist.username === username ? "username" : "email";
        throw BadRequest(`${msg} is exist try another one`);
      }

      usr.username = username;
      usr.email = usr.email;
      usr.security.question = question;
      usr.security.answer = answear;

      if (password) {
        usr.password = password;
      }

      const imgPath = (username) =>
        path.join("uploads", "images", `img-${username}-${Date.now()}.webp`);

      if (req.file) {
        // handle profile image
        if (usr.profileImg) {
          unlinkSync(join(process.cwd(), usr.profileImg));
        }

        imgPath_ = imgPath(usr.username);

        await sharp(req.file.buffer)
          .resize(150, 150)
          .toFormat("webp")
          .toFile(imgPath_);

        usr.profileImg = imgPath_;
      }

      await usr.save();

      await session.commitTransaction();

      delete usr["password"];

      res.json({
        data: usr,
        message: "user has been updated Succesfully",
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  },

  async delete(req, res) {
    const { password } = req.body;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const usr = await User.findOne({ _id: req.user._id }).orFail(
        new NotFound()
      );

      if (!compareSync(password, usr.password)) {
        throw new Unauthorized("password not valid");
      }

      await usr.delete();

      await session.commitTransaction();

      res.json({
        message: "sucssefully deleted user account",
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  },

  async disable(req, res) {
    const { password } = req.body;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const usr = await User.findOne({ _id: req.user._id }).orFail(
        new NotFound()
      );

      if (!compareSync(password, usr.password)) {
        throw new Unauthorized("password not valid");
      }

      usr.isAcitive = false;

      await usr.save();

      await session.commitTransaction();

      res.json({
        message: "sucssefully disabled user account",
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  },
};

// service here

const FilterUser = (query) => {
  return User.findOne({
    $and: [query],
  });
};

const sendPasswordResetToken = async (token, email) => {
  try {
    await mailer.send({
      from: process.env["APP_EMAIL"],
      to: email,
      subject: "Reset your password",
      text: "get the full functionality by reset your password",
      html: `<p>Hello,</p>
    <p>Please click on the following link to reset your password:</p>
    <p><a href="${process.env["APP_URL"]}/api/auth/reset-password/${token}">${process.env["APP_URL"]}/api/auth/reset-password/${token}</a></p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thanks,</p>
    <p>${process.env["APP_NAME"]}</p>`,
    });
  } catch (err) {
    console.log(err.message, err.response.body);
  }
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
