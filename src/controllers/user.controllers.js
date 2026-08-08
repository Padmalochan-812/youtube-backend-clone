import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken  = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError (500, "Something went wrong while generating refresh and access token")
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
    // remove password and refresh token field from response
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
        throw new ApiError(500, "Something went wrong while registrting the user")
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
    //access and refresh token
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

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                loggedInUser
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
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
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError (401, "Invalid refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expire or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {

        throw new ApiError (401, error?.message || "Invalid refresh token")
        
    }


}) 

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old Password")

    }

    user.password = newPassword 
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    const user = req.user
    return res
    .status (200)
    .json(
        new ApiResponse(200, user, "Current User Details fetched")
    )

})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fulName, email} = req.body
    
    if (!fulName || !email) {
        throw new ApiError (400, "All fields are required ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                fulName,
                email: email  //two types aree correct 
            }
        },
        { returnDocument: "after" }
    ).select("-password -refreshToken")

    

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details update successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError (400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError (400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        { returnDocument: "after" }
    ).select("-password -refreshToken")

    return res
    .status (200)
    .json(
        new ApiResponse(200, user, "Avatar Image updated successfully")
    )

})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError (400, "cover file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError (400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status (200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                {
                                    $map: {
                                        input: "$subscribers",
                                        as: "subscriber",
                                        in: "$$subscriber.subscriber"
                                    }
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                // If your schema uses fulName
                fulName: 1,

                // If your schema uses fullName instead, replace the above line with:
                // fullName: 1,

                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched successfully"
        )
    );
});

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
            
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]

            }

        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}; 