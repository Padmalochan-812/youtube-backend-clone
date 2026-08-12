import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {User} from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(404, "video not found ")
    }

    const pageNum = Number (page) || 1;
    const limitNum = Number (limit) || 10;

    const comments = await Comment.find({video: videoId})
    .skip((pageNum - 1 ) * limitNum)
    .limit(limitNum)

    if (comments.length === 0) {
        throw new ApiError(404, "No comments found ..")
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Video comments fetched successfully")
    )

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const  userId  = req.user._id
    const {content} = req.body
    
    if(!content) {
        throw new ApiError (400, "Comment required")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found ")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        user : userId
    })
    if (!comment){
        throw new ApiError(404, "comment not create")
    }

    return res
    .status(200)
    .json (new ApiResponse(200, comment, "Add new comment successful "))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content, videoId} = req.body;

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, " Video not found. ")
    }

    const comment = await Comment.findById(commentId)
    if ( comment.length === 0 ){
        throw new ApiError(404, " comment not found ")
    }

    if(comment.video.toString()!= videoId){
        throw new ApiError(400, "This comment dose not belongs to this video.. ")
    }

    comment.content = content ;
   

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment update successfully.. ")
    )
 
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const {videoId} = req.body

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found..")
    }
    
    const comment = await Comment.findById(commentId)
    
    if(!comment){
        throw new ApiError(404, "Comment not found..")
    }

    if (comment.video.toString() !== videoId){
        throw new ApiError(404, "Comment dose not belongs to this video..")
    }

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(new ApiResponse(200, "", "Video deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}