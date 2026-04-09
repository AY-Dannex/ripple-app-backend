import cors from "cors"
import express from "express"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.route.js"
import cookieParser from "cookie-parser"


const app = express()
app.use(express.json())
app.use(cookieParser())

console.log("FRONTEND_URL:", process.env.FRONTEND_URL)
console.log("NODE_ENV:", process.env.NODE_ENV)

app.use(cors({
    origin: function(origin, callback) {
        callback(null, true)  // allow all origins temporarily
    },
    credentials: true
}))

app.use("/api/user/", userRouter)
app.use("/api/post/", postRouter)

export default app

//route: https://localhost:5000/api/user/register