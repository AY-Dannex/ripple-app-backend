import express from "express"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.route.js"
import cookieParser from "cookie-parser"

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use("/api/user/", userRouter)
app.use("/api/post/", postRouter)

export default app

//route: https://localhost:5000/api/user/register