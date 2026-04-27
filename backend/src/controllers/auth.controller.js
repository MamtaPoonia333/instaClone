const userModel = require('../models/user.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const cookieOptions = {
	httpOnly: true,
	sameSite: 'lax'
};

async function registerController(req, res) {

	try {
		const { username, email, password, bio, profileImg } = req.body || {};

		if (!username || !email || !password) {
			return res.status(400).json({
				message: 'username, email and password are required'
			});
		}

		const isUserExist = await userModel.findOne({
			$or: [{ email }, { username }]
		});

		if (isUserExist) {
			return res.status(409).json({
				message: 'User with this email or username already exists'
			});
		}

		const hashed = crypto.createHash('sha256').update(password).digest('hex');

		const newUser = new userModel({
			username,
			email,
			password: hashed,
			bio,
			profileImg
		});

		await newUser.save();

		const token = jwt.sign(
			{ ID: newUser._id, username: newUser.username },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);

		res.cookie('token', token, cookieOptions);
		return res.status(201).json({
			message: 'User created successfully',
			token,
			user: {
				username: newUser.username,
				email: newUser.email,
				bio: newUser.bio,
				profileImg: newUser.profileImg
			}
		});
	} catch (error) {
		console.error('registerController error:', error.message);
		return res.status(500).json({ message: 'Internal server error' });
	}
}
async function deleteAccountController(req, res) {
	const userId = req.user?.id;
	const requestedEmail = req.params?.email?.trim().toLowerCase();
	const { password } = req.body;

	if (!userId) {
		return res.status(401).json({
			message: 'Unauthorized access'
		});
	}

	if (!password) {
		return res.status(400).json({
			message: 'Password is required'
		});
	}

	try {
		const existingUser = await userModel.findById(userId);

		if (!existingUser) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		if (requestedEmail && existingUser.email.toLowerCase() !== requestedEmail) {
			return res.status(403).json({
				message: 'You can only delete your own account'
			});
		}

		const hashed = crypto.createHash('sha256').update(password).digest('hex');
		if (hashed !== existingUser.password) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		await userModel.findByIdAndDelete(userId);
		res.clearCookie('token', cookieOptions);

		return res.status(200).json({
			message: 'User account deleted successfully'
		});
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}

}
async function editProfileController(req, res) {
	const userId = req.user?.id;
	const { bio, profileImg } = req.body;

	if (!userId) {
		return res.status(401).json({
			message: 'Unauthorized access'
		});
	}

	try {
		const existingUser = await userModel.findById(userId);

		if (!existingUser) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		await userModel.findByIdAndUpdate(userId, {
			bio,
			profileImg
		});

		return res.status(200).json({
			message: 'Profile updated successfully'
		});
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function loginController(req, res) {
	try {
		const { email, password } = req.body || {};

		if (!email || !password) {
			return res.status(400).json({
				message: 'email and password are required'
			});
		}

		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const hashed = crypto.createHash('sha256').update(password).digest('hex');
		if (hashed !== user.password) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		const token = jwt.sign(
			{ ID: user._id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);

		res.cookie('token', token, cookieOptions);
		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				username: user.username,
				email: user.email,
				bio: user.bio,
				profileImg: user.profileImg
			}
		});
	} catch (error) {
		console.error('loginController error:', error.message);
		return res.status(500).json({ message: 'Internal server error' });
	}
}
async function logoutController(req, res) {
	res.clearCookie('token', cookieOptions);
	return res.status(200).json({
		message: 'Logout successful'
	})
	
}
module.exports = {
	registerController,
	loginController,
	deleteAccountController,
	editProfileController,
	logoutController
};