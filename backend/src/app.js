const express = require('express');
const cookies = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./routes/auth.route');
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route');

const app = express();
const healthRouter = require('./routes/health.route');

app.use('/', healthRouter);  // Add before other routes
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    'https://instaclone-1-0zf7.onrender.com',
    'http://localhost:5173'
]
    .flatMap((value) => (value || '').split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    credentials: true,
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    }
};

app.use(cors({
    ...corsOptions
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);

module.exports = app;