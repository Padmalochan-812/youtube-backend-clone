import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!name || !description){
        throw new ApiError(400, "Name and Description are required..")
    }

    const playlist = await Playlist.create({
        name, 
        description,
        owner = req.user._id
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
})

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
        playlistId,
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
        playlistId,
        {$pull:
            {
                videos: videoId
            }
        },
        {returnDocument: "after"}
    );

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found..")
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, "", "Playlist deleted successfully..")
    )
})

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
        new ApiResponse(200, updatePlaylist, "Updated Playlist successfully..")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}