import ApiError from "../utils/apiErrors";
import ApiResponce from "../utils/apiResponce";
import Like from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/users.model.js";




const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const filter = {
        video: videoId,
        likedBy: req.user._id
    };

    // Try deleting first (faster toggle pattern)
    const deletedLike = await Like.findOneAndDelete(filter);

    let liked;

    if (deletedLike) {
        liked = false;
    } else {
        await Like.create(filter);
        liked = true;
    }

    // Get updated like count
    const totalLikes = await Like.countDocuments({ video: videoId });

    return res.status(200).json(
        new ApiResponce(
            200,
            { liked, totalLikes },
            liked ? "Video liked" : "Video unliked"
        )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "Comment id is required");
    }

    const filter = {
        comment: commentId,
        likedBy: req.user._id
    };

    // Try deleting first (faster toggle pattern)
    const deletedLike = await Like.findOneAndDelete(filter);

    let liked;

    if (deletedLike) {
        liked = false;
    } else {
        await Like.create(filter);
        liked = true;
    }

    // Get updated like count
    const totalLikes = await Like.countDocuments({ comment: commentId });

    return res.status(200).json(
        new ApiResponce(
            200,
            { liked, totalLikes },
            liked ? "Comment liked" : "Comment unliked"
        )
    );
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    const filter = {
        tweet: tweetId,
        likedBy: req.user._id
    };

    const deletedLike = await Like.findOneAndDelete(filter);

    let liked;

    if (deletedLike) {
        liked = false;
    } else {
        await Like.create(filter);
        liked = true;
    }

    const totalLikes = await Like.countDocuments({ tweet: tweetId });

    return res.status(200).json(
        new ApiResponce(
            200,
            { liked, totalLikes },
            liked ? "Tweet liked" : "Tweet unliked"
        )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $replaceRoot: { newRoot: "$video" }
        }
    ]);
    if(!likedVideos.length){
        return res.status(200).json(
            new ApiResponce(
                200,
                [],
                "No liked videos found"
            )
        );
    }
    return res.status(200).json(
        new ApiResponce(
            200,
            likedVideos,
            "Liked videos retrieved successfully"
        )
    );
});


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}