const mongoose = require('mongoose');

async function connectDb() {
   const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

   if (!mongoUri) {
      throw new Error('MONGO_URI (or MONGO_URL) is required');
   }

   await mongoose.connect(mongoUri);
   console.log('Connected to MongoDB');
}

module.exports = connectDb;