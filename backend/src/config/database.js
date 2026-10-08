const mongoose = require('mongoose');
const dns = require('node:dns').promises;

function getHostFromMongoUri(mongoUri) {
   try {
      const parsed = new URL(mongoUri);
      return parsed.hostname;
   } catch {
      return null;
   }
}

async function validateMongoSrvDns(mongoUri) {
   if (!mongoUri.startsWith('mongodb+srv://')) {
      return;
   }

   const host = getHostFromMongoUri(mongoUri);

   if (!host) {
      throw new Error('Invalid MONGO_URI format. Expected a valid mongodb+srv:// URI.');
   }

   try {
      await dns.resolveSrv(`_mongodb._tcp.${host}`);
   } catch (error) {
      if (error && (error.code === 'ENOTFOUND' || error.code === 'ENODATA')) {
         throw new Error(
            `MongoDB SRV DNS lookup failed for host "${host}". Check MONGO_URI cluster hostname and DNS/network settings.`
         );
      }

      throw error;
   }
}

async function connectDb() {
   const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

   if (!mongoUri) {
      throw new Error('MONGO_URI (or MONGO_URL) is required');
   }

   await validateMongoSrvDns(mongoUri);

   try {
      await mongoose.connect(mongoUri, {
         serverSelectionTimeoutMS: 10000
      });
   } catch (error) {
      if (error && error.message && error.message.includes('ENOTFOUND')) {
         const host = getHostFromMongoUri(mongoUri);
         throw new Error(
            `Could not resolve MongoDB host "${host || 'unknown'}". Verify MONGO_URI and ensure DNS access is available.`
         );
      }

      throw error;
   }

   console.log('Connected to MongoDB');
}

module.exports = connectDb;