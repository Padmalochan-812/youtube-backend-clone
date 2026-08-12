import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {userId }= req.params

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "user not found..")
    }

    const totalViews = await Video.aggregate([
        {$match: {owner: userId}},
        {$group: {_id: null, totalViews: {$sum: "$views"}}},
    ]);

    const totalVideos = await Video.countDocuments({owner: userId});

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalViews: totalViews[0]?.totalViews || 0,
                totalSubscribers,
                totalVideos
            }
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {page = 1, limit = 10, query, userId } = req.query;
    const sortBy = req.query.sortBy;
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    const filters = {};
    if (owner) filter.owner = userId;
    if(query) filter.query = {$regex: query, $option: "i"};

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const videos = await Video.find(filters)
    .skip({[sortBy]: sortType})
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum )

    if(!videos) {
        throw new ApiError(404, "No videos are uploaded through this channel..")
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel Videos are fetched successfully..")
    )

})

export {
    getChannelStats, 
    getChannelVideos
}