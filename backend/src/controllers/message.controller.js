const mongoose = require('mongoose')
const messageModel = require('../models/message.model')
const userModel = require('../models/user.model')

function getCurrentUserId(req) {
    return req.user?.id
}

function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value)
}

async function sendMessageController(req, res) {
    try {
        const senderId = getCurrentUserId(req)
        const receiverId = typeof req.body?.receiverId === 'string' ? req.body.receiverId.trim() : ''
        const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''

        if (!senderId || !isValidObjectId(receiverId)) {
            return res.status(400).json({ message: 'A valid receiverId is required' })
        }
        if (!content) {
            return res.status(400).json({ message: 'Message content is required' })
        }
        if (content.length > 2000) {
            return res.status(400).json({ message: 'Message must be 2000 characters or fewer' })
        }
        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: 'You cannot message yourself' })
        }

        const receiver = await userModel.findById(receiverId).select('_id username profileImg')
        if (!receiver) {
            return res.status(404).json({ message: 'Recipient not found' })
        }

        const message = await messageModel.create({
            sender: senderId,
            receiver: receiverId,
            content
        })

        return res.status(201).json({
            message: {
                _id: message._id,
                sender: message.sender,
                receiver: message.receiver,
                content: message.content,
                createdAt: message.createdAt
            }
        })
    } catch (error) {
        console.error('sendMessageController error:', error.message)
        return res.status(500).json({ message: 'Unable to send message' })
    }
}

async function getConversationController(req, res) {
    try {
        const currentUserId = getCurrentUserId(req)
        const otherUserId = req.params.userId

        if (!currentUserId || !isValidObjectId(otherUserId)) {
            return res.status(400).json({ message: 'A valid userId is required' })
        }

        const otherUser = await userModel.findById(otherUserId).select('_id username profileImg bio')
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        const messages = await messageModel.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(500)
            .select('_id sender receiver content createdAt')

        return res.status(200).json({
            currentUserId,
            user: otherUser,
            messages
        })
    } catch (error) {
        console.error('getConversationController error:', error.message)
        return res.status(500).json({ message: 'Unable to load conversation' })
    }
}

async function getConversationsController(req, res) {
    try {
        const currentUserId = getCurrentUserId(req)
        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized access' })
        }

        const messages = await messageModel.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('_id sender receiver content createdAt')

        const latestByUser = new Map()
        messages.forEach((message) => {
            const otherUserId = message.sender.toString() === currentUserId.toString()
                ? message.receiver.toString()
                : message.sender.toString()
            if (!latestByUser.has(otherUserId)) latestByUser.set(otherUserId, message)
        })

        const userIds = [...latestByUser.keys()]
        const users = await userModel.find({ _id: { $in: userIds } })
            .select('_id username profileImg bio')
        const usersById = new Map(users.map((user) => [user._id.toString(), user]))

        const conversations = [...latestByUser.entries()]
            .map(([userId, lastMessage]) => ({
                user: usersById.get(userId),
                lastMessage
            }))
            .filter((conversation) => conversation.user)

        return res.status(200).json({ conversations })
    } catch (error) {
        console.error('getConversationsController error:', error.message)
        return res.status(500).json({ message: 'Unable to load conversations' })
    }
}

module.exports = {
    sendMessageController,
    getConversationController,
    getConversationsController
}
