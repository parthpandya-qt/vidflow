import { User } from "../models/User.js";
import { Tweet } from "../models/Tweet.js";

/**
 * Post a community tweet on behalf of a user.
 * @param {string} username - the user's userName
 * @param {string} content - tweet content
 */
export async function postTweet({ username, content }) {
    if (!username?.trim()) {
        return { error: "username is required" };
    }
    if (!content?.trim()) {
        return { error: "content is required" };
    }
    if (content.trim().length > 500) {
        return { error: "content must be 500 characters or fewer" };
    }

    const user = await User.findOne({ userName: username.trim().toLowerCase() }).lean();
    if (!user) {
        return { error: `User "@${username}" not found` };
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: user._id
    });

    return {
        success: true,
        tweet: {
            id: tweet._id,
            content: tweet.content,
            author: user.fullName ?? user.userName,
            postedAt: tweet.createdAt
        }
    };
}
