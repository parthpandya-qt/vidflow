import { Video } from "../models/Video.js";

/**
 * Search videos by keyword in title or description.
 * @param {string} query - search keyword
 * @param {number} limit - max results (default 5)
 */
export async function searchVideos({ query, limit = 5 }) {
    if (!query?.trim()) {
        return { error: "query is required" };
    }

    const videos = await Video.find({
        isPublished: true,
        $or: [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } }
        ]
    })
        .populate("owner", "userName fullName avatar")
        .select("title description thumbnail views duration createdAt owner")
        .sort({ views: -1 })
        .limit(Math.min(Number(limit), 20))
        .lean();

    if (videos.length === 0) {
        return { message: `No videos found for "${query}"`, results: [] };
    }

    return {
        count: videos.length,
        results: videos.map((v) => ({
            id: v._id,
            title: v.title,
            description: v.description?.slice(0, 120) + (v.description?.length > 120 ? "…" : ""),
            thumbnail: v.thumbnail,
            views: v.views,
            duration: v.duration,
            uploadedAt: v.createdAt,
            channel: v.owner?.fullName ?? v.owner?.userName ?? "Unknown"
        }))
    };
}
