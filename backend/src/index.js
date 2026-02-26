import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

connectDB()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    })
    .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
    });

/*
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error connecting to MongoDB:", error);
            throw error;
        });
        console.log("Connected to MongoDB successfully!");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        throw error;
    }
})() 
*/