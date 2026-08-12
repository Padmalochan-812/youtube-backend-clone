import { isValidObjectId } from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comments.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const userId = req.user._id;

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "video  not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        user: userId
    })

    if (existingLike){
        await Like.deleteOne({
            _id :existingLike._id
        });

        return res.status(200).json(
            new ApiResponse(200, null, "Unlike the video..")
        )
    }

    await Like.create({
        video: videoId,
        user: userId
    })

    return res.status(200).json(
        new ApiResponse(200, null, "Like the video..")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const userId = req.user._id
    
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "comment not found..")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        user: userId
    });

    if (existingLike){
        await Like.deleteOne({
            _id: existingLike._id
        })

        return res.status(200).json(
            new ApiResponse(200, null, "Unlike the comment..")
        )
    }

    await Like.create({
        comment: commentId,
        user:userId
    })

    return res.status(200).json(
        new ApiResponse(200, null, "Like the comment..")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    const tweet = await Tweet.findById(tweetId)
    if (!tweet){
        throw new ApiError(404, "Tweet not found..")
    }

    const existingLike = await Like.findOne({
        user: userId,
        tweet: tweetId
    })

    if(existingLike){
        await Like.deleteOne({
            _id : existingLike._id
        });
        return res.status(200).json(
            new ApiResponse(200, null, "unlike the tweet..")
        )
    }

    await Like.create({
        user: userId,
        tweet: tweetId
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Like the tweet..")
    )

});

const getLikedVideos = asyncHandler(async (req, res) => {

    console.log(`Fetching liked videos for user ${req.user._id}`);
    const userId = req.user._id;

    const videos = await Like.find({ user: userId }).populate("video");

    return res.status(200).json(
        new ApiResponse(200, videos, "Liked videos fetched successfully")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
