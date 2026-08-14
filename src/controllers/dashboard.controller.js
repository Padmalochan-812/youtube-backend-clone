import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"


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
    const { page = 1, limit = 10, query, userId } = req.query;

    const sortBy = req.query.sortBy || "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    const filters = {};

    if (userId) {
        filters.owner = userId;
    }

    if (query) {
        filters.title = {
            $regex: query,
            $options: "i"
        };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const videos = await Video.find(filters)
        .sort({ [sortBy]: sortType })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    if (videos.length === 0) {
        throw new ApiError(404, "No videos uploaded.");
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully.")
    );
});

export {
    getChannelStats, 
    getChannelVideos
}