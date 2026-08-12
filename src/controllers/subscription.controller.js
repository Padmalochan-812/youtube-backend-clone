import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    // TODO: toggle subscription
    const { subscriberId } = req.user._id;
    if(subscriberId.toString === channelId) {
        throw new ApiError(400, "you can not subscribe to your own channel..");
    }

    const existingSub = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if(existingSub){
        await Subscription.deleteOne({
            _id: existingSub.id
        })

        return res.status(200).json(
            new ApiResponse(200, null, "Channel unsubscribed..")
        )
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Channel subscribe successfully..")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subscription.find({channel: channelId}).populate(
        "subscriber",
        "username email"
    );

    if(subscribers === 0){
        throw new ApiError(400, "This channel has no subscriber..")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers,"Channel subscribers fetched successfully..")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const channels = await Subscription.find({
        subscriber: subscriberId
    }).populate("subscriber", "username email");

    if(channels.length === 0 ){
        throw new apiError(400, "You did not subscribe any channel yet..");
    }    

    return res.status(200).json(
        new apiResponse(200, channels, "Subscribe channels fetched successfully..")
    )
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}