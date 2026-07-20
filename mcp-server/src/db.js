import mongoose from "mongoose";
import dns from "node:dns/promises";

// Use Cloudflare DNS to resolve MongoDB Atlas SRV records
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const DB_NAME = "vidflow";

const connectDB = async () => {
    try {
        let uri = (process.env.MONGODB_URI || "").trim();
        // Remove surrounding quotes if entered in deployment settings
        uri = uri.replace(/^["']|["']$/g, "").trim();
        // Remove trailing slash if present
        if (uri.endsWith("/")) uri = uri.slice(0, -1);

        if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
            throw new Error(`Invalid MONGODB_URI scheme. Must start with "mongodb://" or "mongodb+srv://". Received value starting with: "${uri.substring(0, 15)}..."`);
        }

        const fullUri = uri.includes(`/${DB_NAME}`) ? uri : `${uri}/${DB_NAME}`;
        const conn = await mongoose.connect(fullUri);
        console.error(`[MCP] Connected to MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error("[MCP] MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
