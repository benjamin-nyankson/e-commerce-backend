const { MongoClient } = require("mongodb");
const dbURI = process.env.DB_URL_NEW;

const client = new MongoClient(dbURI);
const db = client.db("shop");
const usersCollection = db.collection("users");
const productsCollection = db.collection("products");
module.exports = { client, usersCollection, productsCollection };
