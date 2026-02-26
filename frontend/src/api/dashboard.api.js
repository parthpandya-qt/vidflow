import api from "./axiosInstance";

export const getChannelStats = () => api.get("/dashboard/stats");

export const getChannelVideos = () => api.get("/dashboard/videos");
