import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js"
import {User} from "../models/user.model.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {uploadOnCloudinary} from "../utilis/cloudinary.js"
import { ApiResponse } from "../utilis/ApiRespons.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken  = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refereshToken = refereshToken
        await user.save({validateBeforeSave: false })

        return {accessToken, refereshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError (500, "Somthing went wrong while generating referesh and access token")
    }
}



const registerUser = asyncHandler( async (req, res) => {
    
    //        flow of user register 
    // get user details from frontend 
    // validation - not empty 
    // check user already exists : username , email
    // checking cover images and a avatar 
    // upload images to cloudinary 
    // create user object - create entyr in db
    // remove password and referesh token field from response
    // check user creation 
    // return response

    const {fulName, email, username, password } = req.body

    

    if (
        [fulName, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User whit email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    //let coverImageLocalPath;
    // if(req.file && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
    //     coverImageLocalPath = req.files?.coverImage[0]?.path;
    // }

    if (!coverImageLocalPath) {
        coverImageLocalPath = ""
    }


    if (!avatarLocalPath) {
        throw new ApiError (400, "Avtar Image is required ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError (400, "Avtar Image is required ")
    }

    const user = await User.create({
        fulName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById (user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Somthing went wrong while registrting the user")
    }

    return res.status(201).json(
        new ApiResponse (200, createdUser, "User Registered successfully ")
    )


})

const loginUser = asyncHandler( async (req, res ) => {

    //flow of login
    // req body => data
    //user name and email
    //find user 
    //password check
    //access and referesh token
    //send coockies
    //send response

    const {email, username, password } = req.body 


    if (!username && !email) {
        throw new ApiError(400, "Username or email is required ")

    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User dose not exist")
    }

    const isPasswordVild = await user.isPasswordCorrect(password)

    if (!isPasswordVild) {
        throw new ApiError(404, " invalid User credential ")
    }

    const {accessToken, refereshToken} = await generateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refereshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                nser: loggedInUser.accessToken, refereshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refereshToken: undefined
            }
        },
        {
            returnDocument: 'after'
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refereshAccessToken = asyncHandler(async(req, res) => {
    try {
        const incomingRefereshToken = req.cookies.refereshToken || req.body.refereshToken
    
        if (!incomingRefereshToken) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(
            incomingRefereshToken,
            process.env.REFERESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError (401, "Invalid referesh Token")
        }
    
        if(incomingRefereshToken !== user?.refereshToken) {
            throw new ApiError(401, "Referesh token is expire or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefereshToken} = await generateAccessAndRefereshToken(user._id)
    
        return res
        .status(200)
        .cookies("accessToken", accessToken, options)
        .cookies("refereshToken", newRefereshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refereshToken: newRefereshToken},
                "Access Token refereshd"
            )
        )
    } catch (error) {

        throw new ApiError (401, error?.message || "Invalid referesh token")
        
    }


}) 

export { 
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken
}; 