import { Post } from "../models/post.model.js";
import uploadToCloudinary from "../middleware/upload.middleware.js";

const createPost = async (req, res) => {
    try {
        const { description, visibility } = req.body
        let image = null

        if(!description && !visibility) return res.status(400).json({
            message: "Description and visibility are required"
        })

        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer)
            image = result.secure_url
        }

        const post = await Post.create({
            user: req.user._id,
            image,
            description,
            visibility
        })

        res.status(201).json({
            message: "Post Created Successfully", post
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const updatePost = async (req, res) => {
    try {
        // console.log("Users: ", req.user)
        // console.log("Params: ", req.param.id)

        if (Object.keys(req.body).length === 0){
            return res(400).json({
                message: "No data provided for update"
            })
        }

        const post = await Post.findById(req.params.id)

        if (!post) return res.status(404).json({
            message: "Post not found"
        })

        if (post.user.toString() !== req.user._id.toString()) return res.status(403).json({
            message: "Access Denied!!! You are not authorised to edit this post"
        })

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after", runValidators: true }
        )

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        })
        
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("user", "role")
        
        if (!post) return res.status(404).json({
            message: "Post not found"
        })

        const reqUser = req.user
        const postOwner = post.user

        if (reqUser.role === "admin"){
            await Post.findByIdAndDelete(req.params.id)
            return res.json(200).json({
                message: "Post deleted successfully"
            })
        } 

        if (reqUser.role === "moderator" && postOwner.role !== "user") return res.status(403).json({
            message: "Moderators can only delete regular user posts... Access Denied!!!"
        })

        if (reqUser.role !== "admin" && postOwner.role !== "moderator"){
            if(postOwner._id.toString() !== reqUser._id.toString()){
                return res.status(403).json({
                    message: "You can only delete your own post"
                })
            }
        }

        await Post.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            message: "Post deleted successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

const getAllPost = async (req, res) => {
    try {
        if (req.user.role === "admin" || req.user.role === "moderator"){
            const allPost = await Post.find().populate("user", "username email role")
    
            if (!allPost) return res.status(404).json({
                message: "Post not Found"
            })
            res.status(200).json({
                message: "Posts retreived successfully",
                allPost
            })
        }

        if (req.user.role === "user"){
            const allPost = await Post.find({$or: [{ visibility: "public" }, {user: req.user._id}]}).populate("user", "username email role")

            if (!allPost) return res.status(404).json({
                message: "Post not Found"
            })
            res.status(200).json({
                message: "Posts retreived successfully",
                allPost
            })
        }
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error:  ${error.message}`
        })
    }
}

const getUserPost = async (req, res) => {
    try {
        const userPost = await Post.find({user: req.user._id}).populate("user", "username email role")

        if (userPost.length === 0) return res.status(404).json({
            message: "Post not found... No post has been created"
        })

        res.status(200).json({
            message: "Post retrieved successfully",
            userPost
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error:  ${error.message}`
        })
    }
}

export { createPost, updatePost, deletePost, getAllPost, getUserPost }