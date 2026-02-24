import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    
    const channelId = req.user._id;

    const totalVideos = await Video.countDocuments({ owner: channelId });
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select('_id') } });

    return res.status(200).json(
        new ApiResponce(
            200,
            {
                totalVideos,
                totalSubscribers,
                totalLikes
            },
            "channel stats fetched"
        )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner:req.user._id})
    return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    videos,
                    "channel videos fetched"
                )
            )   

})

export {
    getChannelStats, 
    getChannelVideos
    }