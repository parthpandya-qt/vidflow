import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"

import ApiError from "../utils/apiErrors.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/claudinary.js"
import { deleteFromCloudinaryByUrl } from "../utils/deletefiles.js"
import { User } from "../models/users.model.js"
import { Like } from "../models/likes.models.js"
import { Subscription } from "../models/subscriptions.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(15, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * limitNumber;
    const matchStage = {};
    if (query) {
        matchStage.$or = [{
            title: { $regex: query, $options: "i" }
        }, {
            description: { $regex: query, $options: "i" }
        }]
    }
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "invalid user id");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }
    const order = sortType === "asc" ? 1 : -1;

    const video = await Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }

        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                [sortBy]: order
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ])
    if (!video) {
        throw new ApiError(500, "error in server side")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "videos fetched successfully"))

})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    const localvideoFilePath = req.files?.videoFile?.[0]?.path;

    const localthumbNailPath = req.files?.thumbnail?.[0]?.path;

    if (!(title?.trim() && description?.trim() && localvideoFilePath && localthumbNailPath)) {
        throw new ApiError(400, "all fields are required")
    }
    const videoUrl = await uploadOnCloudinary(localvideoFilePath);
    const thumbnailUrl = await uploadOnCloudinary(localthumbNailPath);
    if (!videoUrl?.url || !thumbnailUrl?.url) {
        throw new ApiError(500, "error in uploading video or thumbnail")
    }
    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoFile: videoUrl.url,
        thumbnail: thumbnailUrl.url,
        duration: videoUrl.duration || 0,
        owner: req.user._id
    })
    if (!video) {
        throw new ApiError(500, "error in creating video")
    }
    return res
        .status(201)
        .json(new ApiResponse(201, video, "video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }
    const video = await Video.findById(videoId).populate("owner", "userName fullName avatar")
    if (!video) {
        throw new ApiError(404, "invalid video id")
    }

    // 1. Increment views on the video
    video.views += 1;
    await video.save({ validateBeforeSave: false });

    // 2. Add video to logged-in user's watch history
    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { watchHistory: videoId }
            }
        );
    }

    // 3. Count likes on the video
    const likesCount = await Like.countDocuments({ video: videoId });

    // 4. Check if current user has liked this video
    let isLiked = false;
    if (req.user?._id) {
        const userLike = await Like.findOne({ video: videoId, likedBy: req.user._id });
        isLiked = !!userLike;
    }

    // 5. Check if current user is subscribed to the video owner
    let isSubscribed = false;
    if (req.user?._id && video.owner?._id) {
        const sub = await Subscription.findOne({
            subscriber: req.user._id,
            channel: video.owner._id
        });
        isSubscribed = !!sub;
    }

    // Convert video to object and append the calculated fields
    const videoData = video.toObject();
    if (videoData.owner && typeof videoData.owner === "object") {
        videoData.owner.isSubscribed = isSubscribed;
    }
    videoData.likesCount = likesCount;
    videoData.isLiked = isLiked;

    return res
        .status(200)
        .json(new ApiResponse(200, videoData, "video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to update this video");
    }


    if (title?.trim()) video.title = title.trim();
    if (description?.trim()) video.description = description.trim();


    const localThumbnailPath = req.file?.path;

    if (localThumbnailPath) {

        if (video.thumbnail) {
            await deleteFromCloudinaryByUrl(video.thumbnail);
        }

        const thumbnail = await uploadOnCloudinary(localThumbnailPath);

        if (!thumbnail?.url) {
            throw new ApiError(500, "error uploading thumbnail");
        }

        video.thumbnail = thumbnail.url;
    }

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to delete this video");
    }


    if (video.videoFile) {
        await deleteFromCloudinaryByUrl(video.videoFile);
    }

    if (video.thumbnail) {
        await deleteFromCloudinaryByUrl(video.thumbnail);
    }

    await video.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "not allowed to modify this video");
    }


    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            { isPublished: video.isPublished },
            "publish status toggled successfully"
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}