import api from "./axiosInstance";

export const toggleSubscription = (channelId) =>
    api.post(`/subscriptions/c/${channelId}`);

export const getSubscribedChannels = (subscriberId) =>
    api.get(`/subscriptions/u/${subscriberId}`);


export const getUserChannelSubscribers = (channelId) =>
    api.get(`/subscriptions/c/${channelId}`);

