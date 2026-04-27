const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');
const identifyUser = require('../middleware/auth.middleware');

authRouter.post('/signup', authController.registerController);
authRouter.post('/login', authController.loginController);
authRouter.post('/logout', identifyUser, authController.logoutController);
authRouter.delete('/delete', identifyUser, authController.deleteAccountController);

module.exports = authRouter;