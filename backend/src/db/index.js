import mongoose from "mongoose";
import  { DB_NAME } from "../constants.js";
// Source - https://stackoverflow.com/questions/79875229/mongodb-connection-failed-error-querysrv-econnrefused
// Posted by Sudarsan Sarkar, modified by community. See post 'Timeline' for change history
// Retrieved 2/21/2026, License - null

import dns from "node:dns/promises"
dns.setServers(["1.1.1.1", "1.0.0.1"]);



const connectDB = async () => {
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`connected to ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("Error ", error)
        process.exit(1) 
    }
}

export default connectDB