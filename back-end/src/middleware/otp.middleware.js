import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer"

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Registration",
        html: `<h2>Welcome!</h2><p>Your OTP: <strong>${otp}</strong></p><p>Expires in 5 minutes</p>`
    })
}

export const requestOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) return res.status(400).json({
            message: "Email is required"
        })

        const user = await User.findOne({ email })

        if (user) return res.status(400).json({
            message: "User with this email already exists"
        })

        const otp = generateOTP()

        await OTP.deleteOne({ email })

        await OTP.create({ email, otp })

        await sendOTPEmail(email, otp)

        res.status(200).json({
            message: "OTP sent to your email"
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) return res.status(400).json({
            message: "All fields are required"
        })

        const otpRecord = await OTP.findOne({ email })

        if (!otpRecord) return res.status(404).json({
            message: "OTP not found or expired"
        })

        if (otpRecord.otp !== otp) return res.status(400).json({
            message: "Invalid OTP"
        })

        if (new Date() > otpRecord.expiresAt){
            await OTP.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({
                message: "OTP Already Expired"
            })
        }

        await OTP.deleteOne({ _id: otpRecord._id })

        next()
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}