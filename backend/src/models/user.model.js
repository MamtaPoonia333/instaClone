const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, 'Username is required and must be unique']
    },
    email: {
        type: String,
        required: true,
        unique: [true, 'Email is required and must be unique']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    bio: {
        type: String
    },
    profileImg: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;