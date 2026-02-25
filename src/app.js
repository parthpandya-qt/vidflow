import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));


app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"));
app.use(cookieParser())





import userRouter from "./routes/users.route.js";
import likeRouter from "./routes/like.route.js";
import tweetRouter from "./routes/tweet.route.js";
import dashBoardRouter from "./routes/dashBoard.route.js";
import commentRouter from "./routes/comment.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import videoRouter from "./routes/video.route.js";
import healthcheckRouter from "./routes/";
import playlistRouter from "./routes/playlist.route.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/dashboard",dashBoardRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/playlists",playlistRouter)
export default app;