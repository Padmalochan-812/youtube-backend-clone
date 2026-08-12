import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const userId = req.user._id
    
    if(!content){
        throw new ApiError(400, "Content is required..")
    };
    const tweet = await Tweet.create(
        {
            content: content,
            owner: userId
        });

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweeted successfully..")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId }= req.params;

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, "User don't exists..");
    }
    
    const tweet = await Tweet.find({owner: userId});
    if(!tweet) {
        throw new ApiError(404, "This user dose no tweeted yet..")
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "Got the tweet..")
    )

});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if(tweet.length === 0){
        throw new ApiError(404, "Tweet not found..");
    }

    const { content } = req.body;
    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { returnDocument: "after" }
    );

    if(!updateTweet) {
        throw new ApiError(500, "Failed to update tweet..")
    }

    return res.status(200).json(
        new ApiResponse(200, updateTweet, "Tweet update successfully..")
    )

});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId) ;
    if(tweet.length === 0){
        throw new ApiError(404, " Tweet Deleted successfully..")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new ApiResponse(200, "", "Tweet deleted successfully..")
    )
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}