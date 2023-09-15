const Cart = require("../Modules/cart");
const database = require("../Database/MongoDB");
const ObjectID = require("mongodb").ObjectId;

module.exports.products = async (req, res) => {
  try {
    await database.client.connect();
    const data = await database.productsCollection.find().toArray();

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.AddtoCart = async (req, res) => {
  const { unitPrice, item, image, quantity, email, totalPrice } = req.body;
  const carts = new Cart({
    unitPrice,
    item,
    image,
    quantity,
    email,
    totalPrice,
  });
  const user = await database.usersCollection.findOne({ email: email });
  let existingItem;
  let existingPrice;
  try {
    user?.cart.forEach((item) => {
      existingItem = item.item;
      existingPrice = item.totalPrice;
    });

    if (item === existingItem && totalPrice === existingPrice) {
      res.status(404).send(`Item already exist`);
    } else if (item === existingItem && totalPrice !== existingPrice) {
      res.status(201).json({ message: "update price" });
    } else {
      database.usersCollection.updateOne(
        { _id: user._id },
        { $push: { cart: carts } }
      );
      res.status(201).json({ mesage: "product added successfully" });
    }
  } catch (error) {
    res.status(409).json({ mesage: "cant add" });
  }
};

module.exports.getCarts = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await database.usersCollection.findOne({
      _id: new ObjectID(id),
    });
    if (!user) {
      return res.status(409).json({ message: "Could not fetch cart" });
    }
    res.json({ cart: user?.cart });
    console.log(user);
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "Could not fetch cart" });
  }
};

module.exports.deleteCartItem = async (req, res) => {
  const { userId, itemId } = req.query;

  try {
    const user = await database.usersCollection.findOne({
      _id: new ObjectID(userId),
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const itemIndex = user.cart.filter((cartItem) => cartItem._id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    user.cart.splice(itemIndex, 1);

    await database.usersCollection.updateOne(
      { _id: new ObjectID(userId) },
      { $set: { cart: user.cart } }
    );

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the cart item" });
  }
};
