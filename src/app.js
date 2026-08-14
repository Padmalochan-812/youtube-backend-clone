import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//routes import 

import userRouter from "./routes/user.route.js";

import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import tweetRoute from "./routes/tweet.route.js";
import playlistRoute from "./routes/playlist.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import subscriptionRoute  from "./routes/subscription.route.js";
import  healthcheckRoute from "./routes/healthcheck.route.js";


const app = express()

app.use(cors({
   origin : process.env.CORS_ORIGIN,
   credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/playlist", playlistRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.use("/api/v1/health", healthcheckRoute);

app.use((err, req, res, next) => {
   console.error(`${req.method} ${req.originalUrl} failed:`, err.message);

   return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      errors: err.errors || []
   });
})


//http://localhost:8000/api/v1/users/register


export { app }
