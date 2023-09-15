const { Router } = require("express");
const users = require("../controllers/usersController");
const usersRoute = Router();

usersRoute.get("/users", users.users);
module.exports = usersRoute;
