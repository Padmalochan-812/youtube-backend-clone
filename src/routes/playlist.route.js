import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist 
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/create-playlist").post(verifyJWT, createPlaylist );
router.route("/get/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("/delete/:playlistId").patch(verifyJWT, deletePlaylist);
router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist );
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);
router.route("/user/:userId").get(verifyJWT, getUserPlaylists);

export default router