const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const usersRoute = require("./routes/allUsersRoute");
const productRoute = require("./routes/productsRoute");
const authRoute = require("./routes/authRoute");
const logger = require('./logger');
const winston = require('winston');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(require('express-winston').logger({
    transports: [
      new winston.transports.File({ filename: 'combined.log' })
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));

  app.use((err, req, res, next) => {
    logger.error(`${err.message} - ${err.stack}`);
    res.status(500).send('Something went wrong!');
  });
  

app.use(usersRoute);
app.use(productRoute);
app.use(authRoute);
module.exports = app;
