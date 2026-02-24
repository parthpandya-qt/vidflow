import ApiError from "../utils/apiErrors";
import ApiResponce from "../utils/apiResponce";
import Like from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/users.model.js";




const toggleVideoLike = asyncHandler(async(req,res)=>{
    //Checks if like exists

    //If exists → deletes

    //If not → creates

    //Returns state
    const {videoId} = req.body;
    if (!videoId){
        throw new ApiError(400, "videoId is required")
    }

    const existingLike = await Like.findOne({video:videoId,likedBy:req.user._id})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponce(200,null,"video unliked successfully"))
    }
    await Like.create({video:videoId,likedBy:req.user._id})
    return res.status(200).json(new ApiResponce(200,null,"video liked successfully"))

})