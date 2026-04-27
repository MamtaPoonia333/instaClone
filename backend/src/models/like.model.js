const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
        required: [true, 'Post id is required']
    },
    user: {
        type: String,
        ref: 'users',
        required: [true, 'User id is required']
    }

},
{
    timestamps: true
});
likeSchema.index({ post: 1, user: 1 }, { unique: true });

const likeModel = mongoose.model('Like', likeSchema);
module.exports = likeModel;