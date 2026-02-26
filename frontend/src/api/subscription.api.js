import api from "./axiosInstance";

export const toggleSubscription = (channelId) =>
    api.post(`/subscriptions/c/${channelId}`);

export const getSubscribedChannels = (channelId) =>
    api.get(`/subscriptions/c/${channelId}`);

export const getUserChannelSubscribers = (subscriberId) =>
    api.get(`/subscriptions/u/${subscriberId}`);
