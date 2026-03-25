import multer from "multer"
import cloudinary from "../config/cloudinary.js"

const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "ripple" },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        ).end(fileBuffer)
    })
}
export default upload