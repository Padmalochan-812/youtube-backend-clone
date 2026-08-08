import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    const owner = req.user._id
    console.log("owner : ",owner)
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400, "title and description is reqired")
    }

    const videolocalpath = req.files?.videoFile?.[0]?.path;
    
    if (!videolocalpath) {
        throw new ApiError (400, "video is required")
    }

    const video = await uploadOnCloudinary(videolocalpath); 

    if(!video){
        throw new ApiError(400, "video is requided")
    }

    const thumbinllocalpath = req.files?.thumbinl?.[0]?.path;
    
    const thumbinl = await uploadOnCloudinary(thumbinllocalpath)

    if(!thumbinl) {
        throw new ApiError(400, "thumbinl is required")
    }
     
    const uploadvideo =await Video.create({
        videoFile : video.secure_url,
        videoFilePublicId: video.public_id,
        title: title,
        description: description,
        thumbinl: thumbinl.secure_url,
        thumbinlPublicId: thumbinl.public_id,
        duration: video.duration,
        owner: owner
    })

    if(!video){
        throw new ApiError(500, "Something went wrong while uploding video")
    }

    
    return res.status(201).json(
        new ApiResponse(200, uploadvideo, "video uploded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}