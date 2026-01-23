import mongoose from "mongoose";

// Define the Mongoose cache object type and attach it to the global scope
// This is necessary to persist the connection across hot reloads in development
// and across serverless function invocations in production
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a cached MongoDB connection using Mongoose.
 * @returns The Mongoose connection object.
 */
async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const MONGODB_URI = process.env.MONGODB_URI!;

    if (!MONGODB_URI && process.env.NODE_ENV !== "test") {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_TEST_URI!
        : MONGODB_URI;

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      cached.conn = mongoose;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
