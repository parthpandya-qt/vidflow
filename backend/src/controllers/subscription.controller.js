import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/users.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import ApiError from "../utils/apiErrors.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }
    if(channelId.toString() === req.user._id.toString()){
        throw new ApiError(400,"you cannot subscribe to yourself")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404,"channel not found")
    }   
    const filter = {
        channel: channelId,
        subscriber: req.user._id    
    }
    const deletedSubscription = await Subscription.findOneAndDelete(filter)
    if(!deletedSubscription){
        const newSubscription = await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
        return res.status(200).json(new ApiResponse(200,newSubscription,"subscribed successfully"))
    }
    return res.status(200).json(new ApiResponse(200,deletedSubscription,"unsubscribed successfully"))
})
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }
    const subscribers = await Subscription.aggregate([
    {
        $match: {
            channel: new mongoose.Types.ObjectId(channelId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriber"
        }
    },
    {
        $unwind: "$subscriber"
    },
    {
        $project: {
            _id: 0,
            subscriberId: "$subscriber._id",
            userName: "$subscriber.userName",
            avatar: "$subscriber.avatar"
        }
    }
    ]);
    if(subscribers.length === 0){
        throw new ApiError(400,"no subscriber found")
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "all the subscribers fetched")
      );
})



const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"subscriberId required")
    }
    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField:"channel",
                foreignField:"_id",
                as:"channels"
            }
        },
        {
            $unwind:"$channels"
        },
        {
            $project:{
                _id:0,
                channelId:"$channels._id",
                userName:"$channels.userName",
                avatar:"$channels.avatar"
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            channels,
            "subscribed channels fetched"
        )
    )
}
            
        
)

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}