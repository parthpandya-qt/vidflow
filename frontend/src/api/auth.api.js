import api from "./axiosInstance";

export const registerUser = (formData) =>
    api.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const loginUser = (data) => api.post("/users/login", data);

export const logoutUser = () => api.post("/users/logout");

export const refreshAccessToken = () => api.get("/users/refresh-token");

export const getCurrentUser = () => api.get("/users/current-user");

export const updateAccountDetail = (data) =>
    api.patch("/users/update-account", data);

export const updateAvatar = (formData) =>
    api.patch("/users/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateCoverImage = (formData) =>
    api.patch("/users/update-cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const getUserChannelProfile = (userName) =>
    api.get(`/users/c/${userName}`);

export const getUserwatchHistory = () => api.get("/users/watch-history");
