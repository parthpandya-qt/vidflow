import { describe, it, expect, vi, beforeEach } from "vitest";
import { postTweet } from "./postTweet.js";
import { User } from "../models/User.js";
import { Tweet } from "../models/Tweet.js";

vi.mock("../models/User.js", () => ({
    User: { findOne: vi.fn() }
}));

vi.mock("../models/Tweet.js", () => ({
    Tweet: { create: vi.fn() }
}));

describe("postTweet tool", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should return error if username or content is missing", async () => {
        const res1 = await postTweet({ username: "", content: "hello" });
        expect(res1.error).toBe("username is required");

        const res2 = await postTweet({ username: "user1", content: "" });
        expect(res2.error).toBe("content is required");
    });

    it("should return error if user not found", async () => {
        User.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
        const result = await postTweet({ username: "user1", content: "Hello" });
        expect(result.error).toContain("not found");
    });

    it("should successfully post tweet for existing user", async () => {
        User.findOne.mockReturnValue({
            lean: vi.fn().mockResolvedValue({ _id: "u1", fullName: "User One", userName: "user1" })
        });

        Tweet.create.mockResolvedValue({
            _id: "t1",
            content: "Hello world",
            createdAt: "2024-01-01"
        });

        const result = await postTweet({ username: "user1", content: "Hello world" });

        expect(result.success).toBe(true);
        expect(result.tweet.author).toBe("User One");
        expect(result.tweet.content).toBe("Hello world");
    });
});
