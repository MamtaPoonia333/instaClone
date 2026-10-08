const express = require('express')
const identifyUser = require('../middleware/auth.middleware')
const {
    sendMessageController,
    getConversationController,
    getConversationsController
} = require('../controllers/message.controller')

const messageRouter = express.Router()

messageRouter.use(identifyUser)
messageRouter.get('/conversations', getConversationsController)
messageRouter.get('/:userId', getConversationController)
messageRouter.post('/', sendMessageController)

module.exports = messageRouter
