import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import { Like } from "../models/likes.models.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  const totalLikes = await Like.countDocuments({
    video: { $in: await Video.find({ owner: channelId }).select("_id") },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalSubscribers,
        totalLikes,
      },
      "channel stats fetched"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched"));
});

export { getChannelStats, getChannelVideos };