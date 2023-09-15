const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = Schema({
  item: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
