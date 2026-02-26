import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import ApiError from "../utils/apiErrors.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/users.model.js"




const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"name and description are required")
    }
    if(!req.user?._id){
        throw new ApiError(401,"unauthorized user")
    }
    const playlist = await Playlist.create({
        name:name.trim(),
        description:description.trim(),
        owner:req.user?._id
    })
    if(!playlist){
        throw new ApiError(500,"error in creating playlist")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "playlist created successfully"))

    

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const playlists = await Playlist.find({ owner: userId })
        .select("-__v").sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, playlists, "playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"))
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid playlist id or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to update this playlist");
    }

    const exists = playlist.videos.some(
        v => v.toString() === videoId
    );

    if (exists) {
        throw new ApiError(409, "video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid playlist id or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to update this playlist");
    }

    const exists = playlist.videos.some(
        v => v.toString() === videoId
    );

    if (!exists) {
        throw new ApiError(404, "video not in playlist");
    }

    playlist.videos.pull(videoId);

    await playlist.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, playlist, "video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id");
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    });

    if (!playlist) {
        throw new ApiError(404, "playlist not found or not allowed");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id");
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "name and description are required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to update this playlist");
    }

    playlist.name = name.trim();
    playlist.description = description.trim();

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "playlist updated successfully")
    );
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