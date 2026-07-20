import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWatchHistory } from "./getWatchHistory.js";
import { User } from "../models/User.js";

vi.mock("../models/User.js", () => ({
    User: { findOne: vi.fn() }
}));

describe("getWatchHistory tool", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should return error if username is empty", async () => {
        const result = await getWatchHistory({ username: "" });
        expect(result.error).toBe("username is required");
    });

    it("should return error if user is not found", async () => {
        User.findOne.mockReturnValue({
            populate: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(null)
        });
        const result = await getWatchHistory({ username: "unknownuser" });
        expect(result.error).toContain("not found");
    });

    it("should return formatted watch history items for valid user", async () => {
        const mockUser = {
            userName: "testuser",
            watchHistory: [
                {
                    _id: "vid1",
                    title: "Test Video",
                    thumbnail: "thumb.jpg",
                    views: 100,
                    duration: 120,
                    createdAt: "2024-01-01",
                    owner: { fullName: "Creator One", userName: "creator1" }
                }
            ]
        };

        User.findOne.mockReturnValue({
            populate: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(mockUser)
        });

        const result = await getWatchHistory({ username: "testuser", limit: 5 });

        expect(result.username).toBe("testuser");
        expect(result.count).toBe(1);
        expect(result.history[0].title).toBe("Test Video");
        expect(result.history[0].channel).toBe("Creator One");
    });
});
