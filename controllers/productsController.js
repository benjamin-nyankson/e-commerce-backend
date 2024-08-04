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
  const { unitPrice, item, image, quantity, email, totalPrice, itemId } =
    req.body;
  const carts = new Cart({
    unitPrice,
    item,
    image,
    quantity,
    email,
    totalPrice,
  });

  const items = {
    unitPrice,
    item,
    image,
    quantity,
    email,
    totalPrice,
    itemId,
  };
  // console.log(items)
  const user = await database.usersCollection.findOne({ email: email });
  // await database.cartCollection.insertOne({ userId: user._id, ...items })
  if (!user) {
    res.status(409).json({ mesage: "User does not exist" });
  } else {
    const itemExists = await database.cartCollection
      .find({ userId: user._id, itemId })
      .toArray();
    if (itemExists?.length) {
      res.status(201).send(`Item already exist`);
    } else {
      try {
        await database.cartCollection.insertOne({ userId: user._id, ...items });
        res.status(201).json({ mesage: "product added successfully" });
      } catch (error) {
        res.status(409).json({ mesage: "cant add" });
      }
    }
  }
};

module.exports.getCarts = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await database.cartCollection
      .find({ userId: new ObjectID(id) })
      .toArray();
    console.log(user);
    if (!user) {
      return res.status(409).json({ message: "Could not fetch cart" });
    }
    res.json({ cart: user });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "Could not fetch cart" });
  }
};

module.exports.deleteCartItem = async (req, res) => {
  const { userId, itemId } = req.query;

try {
  const result = await database.cartCollection.findOneAndDelete({
    userId: new ObjectID(userId),
    _id:new ObjectID(itemId), 
  });

  console.log("Item deleted:", result.value);
  if (result.value) {
    res.status(200).json({ message: "Item deleted successfully", item: result.value });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
} catch (error) {
  console.error("Error deleting item:", error);
  res.status(500).json({ error: "An error occurred while deleting the item" });
}
};

module.exports.PurchaseItem = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    // Convert userId and itemId to ObjectId if they are not already
    const userObjectId = new ObjectID(userId);
    const itemObjectId = new ObjectID(itemId);

    // Find the item in the cart
    const userCart = await database.cartCollection
      .find({ userId: userObjectId, _id: itemObjectId })
      .toArray();

    if (!userCart.length) {
      return res.status(404).json("Item not found");
    }

    // Update the item to set the purchased property to true
    await database.cartCollection.updateOne(
      { userId: userObjectId, _id: itemObjectId },
      { $set: { purchased: true } }
    );

    res.status(200).json({ message: "Item marked as purchased" });
  } catch (error) {
    console.error("Error purchasing item:", error);
    res.status(500).json({ error: "An error occurred while purchasing the item" });
  }
};
