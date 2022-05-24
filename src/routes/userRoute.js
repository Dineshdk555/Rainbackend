const express = require("express");
const userModel = require("../models/userModel");
const { hashGenerator } = require("../helpers/Hashing");
const { hashValidator } = require("../helpers/Hashing");
const { JWTtokenGenerator } = require("../helpers/token");
const ActiveSessionModel = require("../models/activeSession");
const { isAuthenticated } = require("../helpers/safeRoutes");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, UserName, password } = req.body;
  userModel.findOne({ email: email }, async (err, isUser) => {
    if (err) {
      return res.json({
        msg: "User Registeration failed",
        error: err,
      });
    } else if (isUser) {
      if (!isUser.aflag) {
        return res.json({
          msg: "This account has been deactivated",
        });
      } else {
        return res.json({
          msg: "Email Already Exist",
        });
      }
    } else {
      const hashPassword = await hashGenerator(password);
      const queryData = {
        email: email,
        UserName: UserName,
        password: hashPassword,
        aflag: true,
      };
      userModel.create(queryData, (err, user) => {
        if (err) {
          return res.json({
            msg: "User Registeration failed",
            error: err,
          });
        } else {
          return res.json({
            success: true,
            msg: "User Registeration successful",
            userID: user._id,
          });
        }
      });
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  userModel.findOne({ email: email }, async (err, isUser) => {
    if (err) {
      return res.json({
        msg: "Login failed",
        error: err,
      });
    } else if (!isUser) {
      return res.json({
        msg: "This email isn't registered yet",
      });
    } else if (!isUser.aflag) {
      return res.json({
        msg: "This account has been deactivated",
      });
    } else {
      const result = await hashValidator(password, isUser.password);
      if (result) {
        const jwtToken = await JWTtokenGenerator({ user: isUser._id });
        const query = {
          userId: isUser._id,
          aflag: true,
          token: "JWT " + jwtToken,
        };
        ActiveSessionModel.create(query, (err, session) => {
          if (err) {
            return res.json({
              msg: "Error Occured!!",
            });
          } else {
            return res.json({
              success: true,
              userID: isUser._id,
              token: "JWT " + jwtToken,
            });
          }
        });
      } else {
        return res.json({
          msg: "Password Doesn't match",
        });
      }
    }
  });
});



module.exports = router;
