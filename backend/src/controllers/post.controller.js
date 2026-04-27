const postModel = require('../models/post.model')
const likeModel = require('../models/like.model')
const ImageKit = require('@imagekit/nodejs')
const { toFile } = require('@imagekit/nodejs')
const mongoose = require('mongoose')

const imagekit = process.env.IMAGEKIT_PRIVATE_KEY
    ? new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    })
    : null

function sanitizeObjectIdParam(value) {
    return String(value || '')
        .trim()
        .replace(/^:/, '')
        .replace(/^['\"]+|['\"]+$/g, '')
}

async function createPostController(req, res) {
    try {
        const userId = req.user?.id
        const username = req.user?.username

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Image file is required'
            })
        }

        if (!imagekit) {
            return res.status(500).json({
                message: 'ImageKit is not configured'
            })
        }

        const file = await imagekit.files.upload({
            file: await toFile(Buffer.from(req.file.buffer), 'file'),
            fileName: 'Test',
            folder: 'cohort-2-insta-clone-posts'
        })

        const post = await postModel.create({
            caption: req.body.caption,
            image: file.url,
            user: userId,
            username: username || '',
            time: new Date()
        })

        return res.status(201).json({
            message: 'Post created successfully.',
            post
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to create post'
        })
    }
}

async function getPostController(req, res) {
    try {
        const posts = await postModel.find({}).sort({ _id: -1 })

        const postIds = posts.map((post) => post._id)
        const likesGrouped = await likeModel.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: '$post', count: { $sum: 1 } } }
        ])

        const likesMap = new Map(likesGrouped.map((item) => [item._id.toString(), item.count]))
        const postsWithCounts = posts.map((post) => {
            const plainPost = post.toObject()
            return {
                ...plainPost,
                likesCount: likesMap.get(post._id.toString()) || 0,
                commentsCount: plainPost.comments?.length || 0
            }
        })

        return res.status(200)
            .json({
                message: 'Posts fetched successfully.',
                posts: postsWithCounts
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch posts'
        })
    }
}

async function getPostDetailsController(req, res) {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        const postId = sanitizeObjectIdParam(req.params.postId)

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        const post = await postModel.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            })
        }

        const likesCount = await likeModel.countDocuments({ post: postId })
        const commentsCount = post.comments?.length || 0

        return res.status(200).json({
            message: 'Post fetched successfully.',
            post,
            likesCount,
            commentsCount
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch post details'
        })
    }
}
async function likePostController(req, res) {
    try {
        const username = req.user?.username
        const postId = sanitizeObjectIdParam(req.params.postId)

        if (!username) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        const isPostExist = await postModel.findById(postId)
        if (!isPostExist) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const isLiked = await likeModel.findOne({
            post: postId,
            user: username
        })

        if (isLiked) {
            return res.status(200).json({
                message: 'Post already liked'
            })
        }

        const doLike = await likeModel.create({
            post: postId,
            user: username
        })

        return res.status(200).json({
            message: 'Post liked successfully',
            like: doLike,
            likesCount: await likeModel.countDocuments({ post: postId })
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(200).json({
                message: 'Post already liked'
            })
        }

        return res.status(500).json({
            message: error.message || 'Failed to like post'
        })
    }
}
async function unlikePostController(req, res) {
    try {
        const username = req.user?.username
        const postId = sanitizeObjectIdParam(req.params.postId)

        if (!username) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        const isPostExist = await postModel.findById(postId)
        if (!isPostExist) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const removedLike = await likeModel.findOneAndDelete({
            post: postId,
            user: username
        })

        if (!removedLike) {
            return res.status(200).json({
                message: 'Post already unliked'
            })
        }

        return res.status(200).json({
            message: 'Post unliked successfully',
            likesCount: await likeModel.countDocuments({ post: postId })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to unlike post'
        })
    }
}
async function addCommentController(req, res) {
    try {
        const username = req.user?.username
        const postId = sanitizeObjectIdParam(req.params.postId)
        const commentText = String(req.body?.comment || '').trim()

        if (!username) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        if (!commentText) {
            return res.status(400).json({
                message: 'Comment is required'
            })
        }

        const post = await postModel.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const updatedPost = await postModel.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    user: username,
                    text: commentText
                }
            }
        }, { returnDocument: 'after' })

        const addedComment = updatedPost?.comments?.[updatedPost.comments.length - 1]

        return res.status(200).json({
            message: 'Comment added successfully',
            comment: addedComment,
            commentsCount: updatedPost?.comments?.length || 0
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to add comment'
        })
    }
}
async function removeCommentController(req, res) {
    try {
        const username = req.user?.username
        const postId = sanitizeObjectIdParam(req.params.postId)
        const commentId = sanitizeObjectIdParam(req.params.commentId)

        if (!username) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: 'Invalid comment id'
            })
        }

        const post = await postModel.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const updatedPost = await postModel.findByIdAndUpdate(postId, {
            $pull: {
                comments: {
                    _id: commentId,
                    user: username
                }
            }
        }, { returnDocument: 'after' })

        const stillExists = updatedPost?.comments?.some((comment) => comment._id.toString() === commentId)
        if (stillExists) {
            return res.status(404).json({
                message: 'Comment not found or not owned by user'
            })
        }

        return res.status(200).json({
            message: 'Comment removed successfully',
            commentsCount: updatedPost?.comments?.length || 0
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to remove comment'
        })
    }
}

async function getPostCommentsController(req, res) {
    try {
        const userId = req.user?.id
        const postId = sanitizeObjectIdParam(req.params.postId)

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Invalid post id'
            })
        }

        const post = await postModel.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const comments = [...(post.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        return res.status(200).json({
            message: 'Comments fetched successfully',
            comments,
            commentsCount: comments.length
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch comments'
        })
    }
}

async function getMyLikedPostsController(req, res) {
    try {
        const username = req.user?.username

        if (!username) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        const likes = await likeModel.find({ user: username }).select('post -_id')
        const likedPostIds = likes.map((item) => item.post.toString())

        return res.status(200).json({
            message: 'Liked posts fetched successfully',
            likedPostIds
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch liked posts'
        })
    }
}

module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController,
    likePostController,
    unlikePostController,
    getMyLikedPostsController,
    addCommentController,
    removeCommentController,
    getPostCommentsController
}