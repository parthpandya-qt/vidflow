import { User } from "../models/User.js";

/**
 * Get a user's watch history by username.
 * @param {string} username - the user's userName
 * @param {number} limit - max items to return (default 10)
 */
export async function getWatchHistory({ username, limit = 10 }) {
    if (!username?.trim()) {
        return { error: "username is required" };
    }

    const user = await User.findOne({ userName: username.trim().toLowerCase() })
        .populate({
            path: "watchHistory",
            select: "title thumbnail views duration createdAt owner",
            populate: { path: "owner", select: "userName fullName" },
            options: { limit: Math.min(Number(limit), 50) }
        })
        .lean();

    if (!user) {
        return { error: `User "@${username}" not found` };
    }

    const history = (user.watchHistory || []).slice(0, Math.min(Number(limit), 50));

    if (history.length === 0) {
        return { message: `No watch history found for @${username}`, history: [] };
    }

    return {
        username: user.userName,
        count: history.length,
        history: history.map((v) => ({
            id: v._id,
            title: v.title,
            thumbnail: v.thumbnail,
            views: v.views,
            duration: v.duration,
            channel: v.owner?.fullName ?? v.owner?.userName ?? "Unknown",
            watchedAt: v.createdAt
        }))
    };
}
