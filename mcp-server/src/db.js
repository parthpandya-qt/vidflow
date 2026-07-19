import mongoose from "mongoose";
import dns from "node:dns/promises";

// Use Cloudflare DNS to resolve MongoDB Atlas SRV records
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const DB_NAME = "vidflow";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.error(`[MCP] Connected to MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error("[MCP] MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
