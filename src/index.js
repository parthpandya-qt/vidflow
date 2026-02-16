import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config();
const app = express();


connectDB()
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