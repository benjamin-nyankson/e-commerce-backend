// const { MongoClient } = require("mongodb");
// const dbURI = process.env.DB_URL_NEW;

// const client = new MongoClient(dbURI);
// const db = client.db("shop");
// const usersCollection = db.collection("users");

const database  = require("../Database/MongoDB");
module.exports.users = async (req, res) => {
  try {
    await database.client.connect();
    const data = await database.usersCollection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
