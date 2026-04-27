const express = require('express');
const userRouter = express.Router();
const identifyUser = require('../middleware/auth.middleware');
const { followUserController } = require('../controllers/user.controller');
const { unfollowUserController } = require('../controllers/user.controller');
const { getFollowersController } = require('../controllers/user.controller');
const { getFolloweesController } = require('../controllers/user.controller');
const { getUserStatsController } = require('../controllers/user.controller');
const { editProfileController } = require('../controllers/user.controller');
const { searchUsersController } = require('../controllers/user.controller');

userRouter.post('/follow/:username', identifyUser, followUserController);
userRouter.post('/unfollow/:username', identifyUser, unfollowUserController);
userRouter.get('/followers/:username', identifyUser, getFollowersController);
userRouter.get('/followees/:username', identifyUser, getFolloweesController);
userRouter.get('/stats/:username', identifyUser, getUserStatsController);
userRouter.put('/edit-profile', identifyUser, editProfileController);
userRouter.get('/search', identifyUser, searchUsersController);

module.exports = userRouter;