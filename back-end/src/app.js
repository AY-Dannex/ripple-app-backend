import cors from "cors"
import express from "express"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.route.js"
import activityRouter from "./routes/activity.route.js"
import cookieParser from "cookie-parser"


const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    // origin: process.env.FRONTEND_URL || "http://localhost:5173",
    origin: function(origin, callback) {
        callback(null, true)  // allow all origins temporarily
    },
    credentials: true
}))

app.use("/api/user/", userRouter)
app.use("/api/post/", postRouter)
app.use("/api/activity-logs/", activityRouter)

export default app

//route: https://localhost:5000/api/user/register