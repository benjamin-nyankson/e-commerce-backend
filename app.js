const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const usersRoute = require("./routes/allUsersRoute");
const productRoute = require("./routes/productsRoute");
const authRoute = require("./routes/authRoute");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use(usersRoute);
app.use(productRoute);
app.use(authRoute);
module.exports = app;
