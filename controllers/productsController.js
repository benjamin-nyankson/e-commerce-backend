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
  const { unitPrice, item, image, quantity, email, totalPrice, itemId, discountPercentage } = req.body;

  const items = {
    unitPrice,
    item,
    image,
    quantity,
    email,
    totalPrice,
    itemId,
    discountPercentage,
  };

  const user = await database.usersCollection.findOne({ email: email });

  if (!user) {
    return res.status(409).json({ message: "User does not exist" });
  }

  const existingItem = await database.cartCollection.findOne({ userId: user._id, itemId });

  if (existingItem) {
    // Calculate the new quantity and total price
    const newQuantity = existingItem.quantity + quantity;
    const newTotalPrice = existingItem.totalPrice + totalPrice;

    try {
      await database.cartCollection.updateOne(
        { userId: user._id, itemId },
        { $set: { quantity: newQuantity, totalPrice: newTotalPrice } }
      );
      return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      return res.status(409).json({ message: "Unable to update product" });
    }
  } else {
    try {
      await database.cartCollection.insertOne({ userId: user._id, ...items });
      return res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
      return res.status(409).json({ message: "Unable to add product" });
    }
  }
};


module.exports.addBulk = async (req, res) => {
  const { email, items } = req.body;
console.log("i will add bulk")
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items must be a non-empty array" });
  }

  const user = await database.usersCollection.findOne({ email: email });
  if (!user) {
    return res.status(409).json({ message: "User does not exist" });
  }

  let addedItems = [];
  let existingItems = [];

  for (const item of items) {
    const { unitPrice, item: itemName, image, quantity, totalPrice, itemId, discountPercentage } = item;

    const itemExists = await database.cartCollection
      .find({ userId: user._id, itemId })
      .toArray();

    if (itemExists.length) {
      existingItems.push(itemId);
    } else {
      try {
        await database.cartCollection.insertOne({
          userId: user._id,
          unitPrice,
          item: itemName,
          image,
          quantity,
          email,
          totalPrice,
          itemId,
          discountPercentage
        });
        addedItems.push(itemId);
      } catch (error) {
        return res.status(500).json({ message: `Error adding item ${itemId}`, error });
      }
    }
  }

  res.status(201).json({
    message: "Process completed",
    addedItems,
    existingItems,
  });
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
