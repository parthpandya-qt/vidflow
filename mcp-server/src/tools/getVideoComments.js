import { Video } from "../models/Video.js";
import { Comment } from "../models/Comment.js";

/**
 * Get comments for a video identified by title keyword.
 * @param {string} videoTitle - partial or full title to search
 * @param {number} limit - max comments to return (default 10)
 */
export async function getVideoComments({ videoTitle, limit = 10 }) {
    if (!videoTitle?.trim()) {
        return { error: "videoTitle is required" };
    }

    const video = await Video.findOne({
        title: { $regex: videoTitle.trim(), $options: "i" },
        isPublished: true
    })
        .select("title thumbnail")
        .lean();

    if (!video) {
        return { error: `No published video found matching "${videoTitle}"` };
    }

    const comments = await Comment.find({ video: video._id })
        .populate("owner", "userName fullName avatar")
        .select("content createdAt owner")
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit), 50))
        .lean();

    return {
        video: {
            id: video._id,
            title: video.title,
            thumbnail: video.thumbnail
        },
        commentCount: comments.length,
        comments: comments.map((c) => ({
            id: c._id,
            content: c.content,
            author: c.owner?.fullName ?? c.owner?.userName ?? "Unknown",
            postedAt: c.createdAt
        }))
    };
}
