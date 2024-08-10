const { Router } = require("express");
const products = require("../controllers/productsController");
const productRoute = Router();

productRoute.get("/products", products.products);
productRoute.post("/addtocart", products.AddtoCart);
productRoute.post("/bulkAddToCart", products.addBulk);
productRoute.get("/cart", products.getCarts);
productRoute.delete("/delete/cartItem", products.deleteCartItem);
productRoute.post("/purchase", products.PurchaseItem);
module.exports = productRoute;
