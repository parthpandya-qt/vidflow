import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { Subscription } from "../models/Subscription.js";
import { Like } from "../models/Like.js";

/**
 * Get aggregate stats for a channel by username.
 * @param {string} username - the channel's userName
 */
export async function getChannelStats({ username }) {
    if (!username?.trim()) {
        return { error: "username is required" };
    }

    const user = await User.findOne({ userName: username.trim().toLowerCase() }).lean();
    if (!user) {
        return { error: `Channel "@${username}" not found` };
    }

    const [totalVideos, totalSubscribers, userVideos] = await Promise.all([
        Video.countDocuments({ owner: user._id, isPublished: true }),
        Subscription.countDocuments({ channel: user._id }),
        Video.find({ owner: user._id, isPublished: true }).select("_id").lean()
    ]);

    const videoIds = userVideos.map((v) => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    return {
        channel: {
            fullName: user.fullName,
            userName: user.userName,
            avatar: user.avatar,
            joinedAt: user.createdAt
        },
        stats: {
            totalVideos,
            totalSubscribers,
            totalLikes
        }
    };
}
