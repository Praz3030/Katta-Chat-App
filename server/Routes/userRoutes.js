const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {
  loginController,
  registerController,
  fetchAllUsersController,
} = require("../Controllers/userControllers");
const Router = express.Router();
const protect = require("../middleware/authMiddleWare");

Router.post("/login", loginController);
Router.post("/register", upload.single("image"), registerController);
Router.get("/fetchUsers", protect, fetchAllUsersController);

module.exports = Router;
