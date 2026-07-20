import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVideoComments } from "./getVideoComments.js";
import { Video } from "../models/Video.js";
import { Comment } from "../models/Comment.js";

vi.mock("../models/Video.js", () => ({
    Video: { findOne: vi.fn() }
}));

vi.mock("../models/Comment.js", () => ({
    Comment: { find: vi.fn() }
}));

describe("getVideoComments tool", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should return error if videoTitle is missing", async () => {
        const result = await getVideoComments({ videoTitle: "" });
        expect(result.error).toBe("videoTitle is required");
    });

    it("should return error if no video matches title", async () => {
        Video.findOne.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(null)
        });
        const result = await getVideoComments({ videoTitle: "Nonexistent" });
        expect(result.error).toContain("No published video found");
    });

    it("should return comments for matching video", async () => {
        Video.findOne.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue({ _id: "vid1", title: "JS Tutorial", thumbnail: "thumb.png" })
        });

        const mockComments = [
            {
                _id: "c1",
                content: "Great video!",
                createdAt: "2024-01-01",
                owner: { fullName: "Alice", userName: "alice" }
            }
        ];

        Comment.find.mockReturnValue({
            populate: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(mockComments)
        });

        const result = await getVideoComments({ videoTitle: "JS Tutorial", limit: 5 });

        expect(result.video.title).toBe("JS Tutorial");
        expect(result.commentCount).toBe(1);
        expect(result.comments[0].author).toBe("Alice");
    });
});
