const express = require('express');
const postRouter = express.Router();
const postController = require('../controllers/post.controller');
const identifyUser = require('../middleware/auth.middleware');
const multer = require('multer');

const memoryStorage = multer.memoryStorage();
const uploadImage = multer({ storage: memoryStorage });

postRouter.use(identifyUser);

postRouter.post('/upload', uploadImage.single('image'), postController.createPostController);

postRouter.get('/get', postController.getPostController);
postRouter.get('/likes/me', postController.getMyLikedPostsController);
postRouter.get('/details/:postId', postController.getPostDetailsController);
postRouter.get('/comments/:postId', postController.getPostCommentsController);
postRouter.post('/like/:postId', postController.likePostController);
postRouter.post('/unlike/:postId', postController.unlikePostController);
postRouter.post('/comment/:postId', postController.addCommentController);
postRouter.delete('/comment/:postId/:commentId', postController.removeCommentController);

module.exports = postRouter;