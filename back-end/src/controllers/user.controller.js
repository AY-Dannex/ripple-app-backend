import { User } from "../models/user.model.js"
import { Post } from "../models/post.model.js"
import { uploadToCloudinary } from "../middleware/upload.middleware.js"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body

        if(!firstName || !lastName || !username || !email || !password) return res.status(400).json({
            message: "All fields are required"
    })

    const existEmail = await User.findOne({ email: email.toLowerCase() })
    const existUsername = await User.findOne({ username: username.toLowerCase() })

    if(existEmail) return res.status(400).json({
        message: "User with current email already exists"
    })

    if(existUsername) return res.status(400).json({
        message: "Username already taken"
    })

    const user = await User.create({
        firstName,
        lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        bio: "",
        role: "user",
        loggedIn: false
    })

    res.status(201).json({
        message: "User created successfully",
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, role: user.role }
    })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password) return res.status(400).json({
            message: "All fields are required"
        })

        const user = await User.findOne({ email: email.toLowerCase() })

        if(!user) return res.status(404).json({
            message: "User not found"
        })

        const passwordMatch = await user.comparePassword(password)

        if(!passwordMatch) return res.status(400).json({
            message: "Invalid credentials"
        })

        if (user.suspendedUntil && user.suspendedUntil > new Date()) return res.status(403).json({
            message: `Unable to login... You account has been suspended until ${user.suspendedUntil}`
        })

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET_TOKEN,
            {
                expiresIn: "1d"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const getProfile = async (req, res) => {
    const profile = req.user
    try {
        res.status(200).json({
            message: "Profile retreived successfully",
            profile: {
                id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                username: profile.username,
                email: profile.email,
                bio: profile.bio,
                role: profile.role,
                created: profile.createdAt,
                updated: profile.updatedAt
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error}`
        })
    }
}

const uploadProfilePic = async (req, res) => {
    try {
        const id = req.user._id
        let imageUrl = null

        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer)
            imageUrl = result.secure_url
        }else{
            return res.status(400).json({
                message: "No file uploaded"
            })
        }

        const updatedUser = await User.findByIdAndUpdate(id, {profilePic: imageUrl}, { returnDocument: "after" })
        
        if (!updatedUser) return res.status(404).json({
                message: "User not found"
            })
        

        res.status(200).json({
            message: "Avatar updated successfully",
            profilePic: updatedUser.profilePic
        })

    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body
        let { email, username } = req.body

        const id = req.user._id

        if (!id) return res.status(400).json({
            message: "No ID found" 
        })

        if (!firstName && !lastName && !username && !email && !bio) return res.status(400).json({
            message: "Minimum of 1 field must be updated"
        })
        
        const updateFields = {}

        if (email){
            email = email.toLowerCase()
            // console.log("Checking email:", email)

            const emailExists = await User.findOne({ email, _id: { $ne: id } })
            // console.log("Email exists:", emailExists)

            if(emailExists) return res.status(400).json({
                message: "User with the email already exists"
            })

            updateFields.email = email
        }

        if(username){
            username = username.toLowerCase()
            const usernameExists = await User.findOne({ username, _id: { $ne: id } })

            if(usernameExists) return res.status(400).json({
                message: "Username already taken"
            })

            updateFields.username = username
        }

        if(firstName) updateFields.firstName = firstName
        if(lastName) updateFields.lastName = lastName
        if(bio) updateFields.bio = bio


        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { returnDocument: "after" })

        if (!updatedUser) return res.status(404).json({
            message: "User not found"
        })

        res.status(200).json({
            message: "Profile updated successfully",
            profile: {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                role: updatedUser.role
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal server error ${error.message}`
        })
    }
}

const logoutUsers = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            samesite: "none",
            secure: process.env.NODE_ENV,
            expires: new Date(0) //Expire immediately
        })

        res.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const assignRole = async (req, res) => {
    try {
        const { email, newRole } = req.body

        if (!email || !newRole) return res.status(400).json({
            message: "All fields are required"
        })

        if (req.user.role !== "admin") return res.status(403).json({
            message: "Access Denied!! Only admin is allowed to assign roles"
        })

        const user = await User.findOne({email: email.toLowerCase()})
        
        if (!user) return res.status(404).json({
            message: "User not found"
        })

        const allowedRoles = ["user", "moderator"]

        if (!allowedRoles.includes(newRole)) return res.status(403).json({
            message: `${newRole} is an invalid role`
        })

        if (req.user.role === "admin" && user.role === "admin") return res.status(403).json({
            message: "admin cannot assign roles for other admins"
        })

        await User.findByIdAndUpdate(user._id, {role: newRole})

        res.status(200).json({
            message: "Role assigned successfully",
            user
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const suspendUser = async (req, res) => {
    try {
        const { email, suspendedUntil } = req.body
    
        if (!email || ! suspendedUntil) return res.status(400).json({
            message: "All fields are required"
        })

        if (req.user.role !== "admin") return res.status(403).json({
            message: "Only admins can suspend users account"
        })

        const user = await User.findOne({ email })

        if (!user) return res.status(404).json({
            message: "User not found"
        })

        if (user._id.toString() === req.user._id.toString()) return res.status(403).json({
            message: "You cannot suspend yourself as an admin"
        })

        if (user.role === "admin") return res.status(403).json({
            message: "Admins can't suspend other admins"
        })

        await User.findByIdAndUpdate(user._id, {suspendedUntil})

        res.status(200).json({
            message: "User suspended successfully"
        })
    } catch (error) {
         res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const deleteUser = async (req, res) => {
    try {  
        if (req.user.role === "admin"){
            const { email } = req.body

            if (!email) return res.status(400).json({
                message: "Email field required"
            })

            const user = await User.findOne({ email }) 

            if (!user) return res.status(404).json({
                message: "User not found"
            })

            if (req.user._id.toString() === user._id.toString()) return res.status(403).json({
                message: "Admin can't delete other admins account"
            })

            await Post.deleteMany({ user: user._id })

            await User.findByIdAndDelete(user._id)

            res.status(200).json({
                message: "User deleted successfully"
            })
        }else{
            await Post.deleteMany({ user: req.user._id })

            await User.findByIdAndDelete(req.user._id)

            res.clearCookie("token")

            res.status(200).json({
                message: "User deleted successfully"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

export { registerUser, loginUsers, getProfile, uploadProfilePic,updateProfile, logoutUsers, assignRole, suspendUser, deleteUser }