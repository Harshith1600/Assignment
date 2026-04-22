const express = require('express');
const authRouter = express.Router();

const authController=require('../controllers/authController')

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);
authRouter.get("/profile", authController.getProfile);
authRouter.post("/profile", authController.postProfile);
authRouter.post("/logout",authController.postLogout);

exports.authRouter = authRouter ;