const { Router } = require("express");
const products = require("../controllers/productsController");
const productRoute = Router();

productRoute.get("/products", products.products);
productRoute.post("/addtocart", products.AddtoCart);
productRoute.get("/cart", products.getCarts);
productRoute.delete("/delete/cartItem", products.deleteCartItem);
module.exports = productRoute;
