import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/users.route.js";
import videoRouter from "./routes/video.route.js";
import playlistRouter from "./routes/playlist.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import dashboardRouter from "./routes/dashBoard.route.js";
import tweetRouter from "./routes/tweet.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// API routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

// Global JSON error handler — converts all ApiErrors into clean JSON responses
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    data: null,
  });
});

export default app;