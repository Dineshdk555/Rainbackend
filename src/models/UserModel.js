const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
 
  email: {
    type: String,
    required: true,
  },
  UserName:{
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  aflag: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("UserModel", userSchema);
