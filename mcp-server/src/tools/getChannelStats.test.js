import { describe, it, expect, vi, beforeEach } from "vitest";
import { getChannelStats } from "./getChannelStats.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { Subscription } from "../models/Subscription.js";
import { Like } from "../models/Like.js";

vi.mock("../models/User.js", () => ({
    User: { findOne: vi.fn() }
}));
vi.mock("../models/Video.js", () => ({
    Video: { countDocuments: vi.fn(), find: vi.fn() }
}));
vi.mock("../models/Subscription.js", () => ({
    Subscription: { countDocuments: vi.fn() }
}));
vi.mock("../models/Like.js", () => ({
    Like: { countDocuments: vi.fn() }
}));

describe("getChannelStats tool", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should return error if username is empty", async () => {
        const result = await getChannelStats({ username: "" });
        expect(result.error).toBe("username is required");
    });

    it("should return error if channel not found", async () => {
        User.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
        const result = await getChannelStats({ username: "nobody" });
        expect(result.error).toContain("not found");
    });

    it("should return correct channel stats", async () => {
        const mockUser = {
            _id: "6a5c95d5f987ab61a2ec9749",
            fullName: "John Doe",
            userName: "johndoe",
            avatar: "http://example.com/avatar.jpg",
            createdAt: new Date("2024-01-01")
        };

        User.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(mockUser) });

        // Video.countDocuments → 10 videos
        Video.countDocuments.mockResolvedValue(10);

        // Video.find for like aggregation
        const mockVideoIds = [{ _id: "vid1" }, { _id: "vid2" }];
        Video.find.mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue(mockVideoIds) });

        // Subscription.countDocuments → 500 subs
        Subscription.countDocuments.mockResolvedValue(500);

        // Like.countDocuments → 3200 total likes
        Like.countDocuments.mockResolvedValue(3200);

        const result = await getChannelStats({ username: "johndoe" });

        expect(result.channel.userName).toBe("johndoe");
        expect(result.stats.totalVideos).toBe(10);
        expect(result.stats.totalSubscribers).toBe(500);
        expect(result.stats.totalLikes).toBe(3200);
    });
});
