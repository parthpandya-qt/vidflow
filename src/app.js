import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
// Skip body parsing for multipart — body-parser consumes the stream before multer
app.use((req, res, next) => {
  const isMultipart = (req.headers["content-type"] || "").includes("multipart/form-data");
  if (isMultipart) return next();
  express.json({ limit: "16kb" })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ limit: "16kb", extended: true })(req, res, next);
  });
});
app.use(express.static("public"));
app.use(cookieParser())






import userRouter from "./routes/users.route.js";
//routes declaration
app.use("/api/v1/users",userRouter)


export default app;