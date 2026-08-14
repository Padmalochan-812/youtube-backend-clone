import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import{User} from "../models/user.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId  = req.user._id

    //TODO: create playlist
    if (!name || !description){
        throw new ApiError(400, "Name and Description are required..")
    }

    const playlist = await Playlist.create({
        name, 
        description,
        owner: userId
    })
    
    return res.status(200).json(
        new ApiResponse(200, playlist, "playlist crated successfully..")
    )
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    //TODO: get user playlists
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(404, "User not find..")
    }
    
    const playlist = await Playlist.find({owner: userId});
    
    if(playlist.length ===0 ){
        throw new ApiError(404, "User has not created any playlist..")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully..")
    )
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found..")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully..")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video not found..")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found..")
    }
    
    if(playlist.videos.includes(videoId)) {
        throw new ApiError(400, "This video is in your playlist..");
    }

    const updatePlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId },
        {$push: 
            {
                videos: videoId
            }
        },
        {returnDocument: "after"}
    );
    if (!updatePlaylist){
        new ApiError(404, "Video not added in the playlist..")
    }
    
    return res.status(200).json(
        new ApiResponse(200, updatePlaylist, "video added in the playlist..")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const video = await Video.findById(videoId);
    if (!video){
        throw new ApiError(404, "Video not found..")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found..")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        {$pull:
            {
                videos: videoId
            }
        },
        {returnDocument: "after"}
    );

    return res.status(200).json(
        new ApiResponse(200, updatePlaylist, "video remove from the playlist..")
    )

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    console.log(playlistId)
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found..")
    }
    console.log(playlist)
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, "", "Playlist deleted successfully..")
    )
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist){
        throw new ApiError(404, "playlist not found..")
    }

    const updates = {};
    if(name) updates.name = name;
    if(description) updates.description = description;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$set: updates},
        {returnDocument: "after"}
    );

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Updated Playlist successfully..")
    )
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}