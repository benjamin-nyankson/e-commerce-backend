const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
  fname: {
    type: String,
    required: true,
  },

  lname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  confirmPass: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
  },
  country: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  isAdmin: {
    type: Boolean,
  },
  cart: [{}],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
