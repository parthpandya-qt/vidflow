import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchVideos } from "./searchVideos.js";
import { Video } from "../models/Video.js";

vi.mock("../models/Video.js", () => ({
    Video: {
        find: vi.fn()
    }
}));

describe("searchVideos tool", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should return error if query is empty", async () => {
        const result = await searchVideos({ query: "" });
        expect(result.error).toBe("query is required");
    });

    it("should return matching videos with mapped fields", async () => {
        const mockVideos = [
            {
                _id: "6a5c963ff987ab61a2ec974f",
                title: "Learn JavaScript",
                description: "A full tutorial on JavaScript fundamentals",
                thumbnail: "http://example.com/thumb.jpg",
                views: 1200,
                duration: 3600,
                createdAt: new Date("2025-01-01"),
                owner: { fullName: "John Doe", userName: "johndoe" }
            }
        ];

        // Mock chained query: .find().populate().select().sort().limit().lean()
        const chainMock = {
            populate: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(mockVideos)
        };
        Video.find.mockReturnValue(chainMock);

        const result = await searchVideos({ query: "JavaScript", limit: 5 });

        expect(Video.find).toHaveBeenCalledWith(
            expect.objectContaining({
                isPublished: true,
                $or: expect.arrayContaining([
                    { title: expect.objectContaining({ $options: "i" }) }
                ])
            })
        );
        expect(result.count).toBe(1);
        expect(result.results[0].title).toBe("Learn JavaScript");
        expect(result.results[0].views).toBe(1200);
        expect(result.results[0].channel).toBe("John Doe");
    });

    it("should return empty message if no videos found", async () => {
        const chainMock = {
            populate: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue([])
        };
        Video.find.mockReturnValue(chainMock);

        const result = await searchVideos({ query: "zzznoresultszzz" });
        expect(result.message).toContain("No videos found");
        expect(result.results).toHaveLength(0);
    });
});
