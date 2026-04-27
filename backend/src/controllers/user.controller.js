const followModel = require('../models/follow.model')
const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
}

async function followUserController(req, res) {
    const followerName = req.user.username
    const followeeName = req.params.username

    if (!followerName) {
        return res.status(401).json({
            message: 'Invalid token payload: username missing'
        })
    }

    if (followerName === followeeName) {
        return res.status(400).json({
            message: 'You cannot follow yourself'
        })
    }

    const followeeUser = await userModel.findOne({ username: followeeName })
    if (!followeeUser) {
        return res.status(404).json({
            message: 'The user you are trying to follow does not exist'
        })
    }

    const existingFollow = await followModel.findOne({
        follower: followerName,
        followee: followeeName
    })

    if (existingFollow) {
        return res.status(200).json({
            message: 'You are already following this user',
            followRecord: existingFollow
        })
    }

    try {
        const followRecord = await followModel.create({
            follower: followerName,
            followee: followeeName
        })

        return res.status(200).json({
            message: 'Followed user successfully',
            followRecord
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(200).json({
                message: 'You are already following this user'
            })
        }

        throw error
    }
}

async function unfollowUserController(req, res) {
    const followerName = req.user.username
    const followeeName = req.params.username

    if (!followerName) {
        return res.status(401).json({
            message: 'Invalid token payload: username missing'
        })
    }

    const existingFollow = await followModel.findOne({
        follower: followerName,
        followee: followeeName
    })
    if (!existingFollow) {
        return res.status(400).json({
            message: 'You are not following this user'
        })
    }
    await followModel.findOneAndDelete({
        follower: followerName,
        followee: followeeName
    })
    return res.status(200).json({
        message: 'Unfollowed user successfully'
    })
}

async function getFollowersController(req, res) {
    try {
        const username = req.params.username
        const followers = await followModel.find({ followee: username }).select('follower -_id')
        return res.status(200).json({
            message: 'Followers retrieved successfully',
            followers
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error'
        })
    }
}

async function getFolloweesController(req, res) {
    try {
        const username = req.params.username
        const followees = await followModel.find({ follower: username }).select('followee -_id')
        return res.status(200).json({
            message: 'Followees retrieved successfully',
            followees
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error'
        })
    }
}

async function getUserStatsController(req, res) {
    try {
        const username = req.params.username
        const [followersCount, followeesCount] = await Promise.all([
            followModel.countDocuments({ followee: username }),
            followModel.countDocuments({ follower: username })
        ])

        return res.status(200).json({
            message: 'User stats fetched successfully',
            followersCount,
            followeesCount
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error'
        })
    }
}

async function editProfileController(req, res) {
    try {
        const userId = req.user?.id
        const { bio, username, avatar, profileImg } = req.body

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized access'
            })
        }

        const existingUser = await userModel.findById(userId)
        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const nextUsername = typeof username === 'string' ? username.trim() : undefined
        if (nextUsername && nextUsername !== existingUser.username) {
            const usernameTaken = await userModel.findOne({ username: nextUsername })
            if (usernameTaken) {
                return res.status(409).json({
                    message: 'Username already exists'
                })
            }
        }

        const updateData = {}
        if (bio !== undefined) updateData.bio = bio
        if (nextUsername) updateData.username = nextUsername
        if (avatar !== undefined) updateData.profileImg = avatar
        if (profileImg !== undefined) updateData.profileImg = profileImg

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { returnDocument: 'after' }
        )

        const token = jwt.sign(
            { ID: updatedUser._id, username: updatedUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.cookie('token', token, cookieOptions)

        return res.status(200).json({
            message: 'Profile updated successfully',
            token,
            user: {
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profileImg: updatedUser.profileImg
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error'
        })
    }
}

async function searchUsersController(req, res) {
    try {
        const query = (req.query.username || '').trim()

        if (!query) {
            return res.status(400).json({
                message: 'username query is required'
            })
        }

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const users = await userModel.find({
            username: { $regex: escapedQuery, $options: 'i' }
        })
            .select('username bio profileImg -_id')
            .limit(20)

        return res.status(200).json({
            message: 'Users fetched successfully',
            users
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error'
        })
    }
}

module.exports = {
    followUserController,
    unfollowUserController,
    getFollowersController,
    getFolloweesController,
    getUserStatsController,
    editProfileController,
    searchUsersController
}