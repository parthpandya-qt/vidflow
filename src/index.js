import dotenv from "dotenv";
dotenv.config({path: "./.env"});
import connectDB from "./db/index.js";
import app from "./app.js";





connectDB()
.then(()=>{app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT }`);
})})
.catch((error)=>{
    console.log("Error connecting to MongoDB")
    process.exit(1)
})

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