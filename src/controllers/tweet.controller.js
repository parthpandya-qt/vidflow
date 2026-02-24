import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"

import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
        const {content} = req.body
        if(!content){
            throw new ApiError(400,"content is required")
        }
        const tweet = await Tweet.create({
            content:content,
            owner:req.user?._id
        })
        return res
                .status(200)
                .json( new ApiResponce(
                    200,
                    tweet,
                    "tweet created"
                ))
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid user id")
    }
    
    const tweets = await Tweet.find({owner:userId})
    return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    tweets,
                    "user tweets fetched"
                )
            )
    
    
    
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    tweet.content = content.trim();
    await tweet.save();

    return res.status(200).json(
        new ApiResponce(
            200,
            tweet,
            "Tweet updated successfully"
        )
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            tweet,
            "Tweet deleted successfully"
        )
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}