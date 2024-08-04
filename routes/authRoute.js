const { Router } = require("express");
const authController = require("../controllers/authController");
const authRoute = Router();


authRoute.post("/user/register", authController.signup);
authRoute.post("/confirm", authController.confirm);
authRoute.post("/user/login", authController.login);
authRoute.post("/forgetPassword", authController.forgetPassword);
authRoute.post("/resetPassword", authController.resetPassword);
authRoute.post("/getToken", authController.refreshToken);

authRoute.get('/user/profile', authController.protectedRoute, (req, res) => {
    // This route is protected, only accessible with a valid access token
    res.json({ message: 'User profile', user: req.user });
  });
module.exports = authRoute;
