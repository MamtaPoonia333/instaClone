require("dotenv").config();
const app = require("./backend/src/app");
const connectDb = require("./backend/src/config/database");

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDb();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();