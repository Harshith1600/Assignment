const express = require('express');
const userRouter = express.Router();

const storeController=require('../controllers/userController')
userRouter.get("/", storeController.load);
module.exports = userRouter;