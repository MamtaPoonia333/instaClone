const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']

    },
    user: {
        ref: 'user',
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'user is required']
    },
    username: {
        type: String,
        default: ''
    },
    comments: [
        {
            user: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    time: {
        type: Date
    }

});
const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;