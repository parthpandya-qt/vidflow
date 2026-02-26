import api from "./axiosInstance";

export const createPlaylist = (data) => api.post("/playlists", data);

export const getPlaylistById = (playlistId) =>
    api.get(`/playlists/${playlistId}`);

export const updatePlaylist = (playlistId, data) =>
    api.patch(`/playlists/${playlistId}`, data);

export const deletePlaylist = (playlistId) =>
    api.delete(`/playlists/${playlistId}`);

export const addVideoToPlaylist = (videoId, playlistId) =>
    api.patch(`/playlists/add/${videoId}/${playlistId}`);

export const removeVideoFromPlaylist = (videoId, playlistId) =>
    api.patch(`/playlists/remove/${videoId}/${playlistId}`);

export const getUserPlaylists = (userId) =>
    api.get(`/playlists/user/${userId}`);
