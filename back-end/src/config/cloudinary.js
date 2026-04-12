import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "du5nvidil",
    api_key: process.env.CLOUDINARY_API_KEY || "936953397738825",
    api_secret: process.env.CLOUDINARY_API_SECRET || "9V-yHUfy8azpWytUYNsFge12dcQ"
})

export default cloudinary