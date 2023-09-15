const mongoose = require("mongoose");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = require("./app");
require("dotenv/config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node JS API for e-commerce",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8000/",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: This endpoint provides information about all the users in the database.
 *     responses:
 *       200:
 *         description: Successful response
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Get all the products in the database
 *     responses:
 *       200:
 *         description: Successful response
 * /cart:
 *   get:
 *     summary: Get cart items
 *     description: Get all the products in a users's cart
 *     responses:
 *       200:
 *         description: Successful response
 */


const dbURI = process.env.DB_URL_NEW;
mongoose
  .connect(dbURI)
  .then((result) => {
    app.listen(8000);
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log("Couldn't connect to the database");
    console.log(err);
  });
