import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, cloudinary } from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const sortBy = req.query.sortBy || "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    const filter = {};
    
    if (userId) filter.owner = userId;
    if (query) filter.title = { $regex: query, $options: "i" };

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType})
        .skip((pageNum - 1) * limitNum) 
        .limit(limitNum)

    if (!videos) {
        throw new ApiError (400, "There is no such videos..")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "videos are fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    const owner = req.user._id
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400, "title and description is required")
    }

    const videolocalpath = req.files?.videoFile?.[0]?.path;
    
    if (!videolocalpath) {
        throw new ApiError (400, "video is required")
    }

    const video = await uploadOnCloudinary(videolocalpath); 

    if(!video){
        throw new ApiError(400, "video is required")
    }

    const thumbnaillocalpath = req.files?.thumbnail?.[0]?.path;
    
    const thumbnail = await uploadOnCloudinary(thumbnaillocalpath)

    if(!thumbnail) {
        throw new ApiError(400, "Thumbnail is required")
    }
     
    const uploadvideo =await Video.create({
        videoFile : video.secure_url,
        videoFilePublicId: video.public_id,
        title: title,
        description: description,
        thumbnail: thumbnail.secure_url,
        thumbnailPublicId: thumbnail.public_id,
        duration: video.duration,
        owner: owner
    })
    
    
    if(!video){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    
    return res.status(200).json(
        new ApiResponse(200, uploadvideo, "video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)

    if (!video){
        throw new ApiError(400, "there is no such video")
    }

    return res
        .status(200)
        .json(new ApiResponse (200, video, "video fetched successfully by Id"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body

    const newThumbnailFilePath = req.files?.thumbnail?.[0]?.path;
    if (!newThumbnailFilePath){
        throw new ApiError(400, "Thumbnail is no provided")

    }

    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(400, "Video not found")
    }

    const newThumbnail = await uploadOnCloudinary(newThumbnailFilePath)

    if (!newThumbnail){
        throw new ApiError(400, "Failed to upload new thumbnail..");
    }

    if (video?.thumbnailPublicId) {
    
        try {
            await cloudinary.uploader.destroy(video.thumbnailPublicId, {
                resource_type: "image",
            });
        }
        catch(error) {
            throw new ApiError(500, error.message, "Failed to delete old Thumbnail image")
        }
    }
    const updates = {}
    if (title) updates.title = title;
    if (description) updates.description = description;
    updates.thumbnail = newThumbnail.secure_url;
    updates.thumbnailPublicId = newThumbnail.public_id;

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updates
        },
        { returnDocument: "after" }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully..")
    )

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId){
        throw new ApiError(400, "video id not provided..")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, "Video not found")
    }

    if(video?.thumbnailPublicId){
        
        try{
            await cloudinary.uploader.destroy(video?.thumbnailPublicId, {resource_type: "image" })
        } catch(error){
            throw new ApiError (500, "failed to delete thumbnail", error.message);
        }
    }

    if(video.videoFilePublicId){
        try{
            await  cloudinary.uploader.destroy(video?.videoFilePublicId, {resource_type: "video"})
        } catch(error) {
            throw new ApiError(500, "failed to delete video", error.message);
        }
    }

    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(new ApiResponse(200, "", "Video deleted successfully"))

}) 

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video nor found ..")
    }
    video.isPublished = !video.isPublished
    await video.save();
    

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish video toggled .."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}