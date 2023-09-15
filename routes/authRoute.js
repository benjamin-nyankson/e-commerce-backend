const { Router } = require("express");
const authController = require("../controllers/authController");
const authRoute = Router();


authRoute.post("/user/register", authController.signup);
authRoute.post("/confirm", authController.confirm);
authRoute.post("/user/login", authController.login);
authRoute.post("/forgetPassword", authController.forgetPassword);
authRoute.post("/resetPassword", authController.resetPassword);
module.exports = authRoute;
