import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVideoById } from "./video.controller.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/users.model.js";
import { Like } from "../models/likes.models.js";
import { Subscription } from "../models/subscriptions.model.js";

vi.mock("../models/video.model.js", () => {
    return {
        Video: {
            findById: vi.fn()
        }
    };
});

vi.mock("../models/users.model.js", () => {
    return {
        User: {
            findByIdAndUpdate: vi.fn()
        }
    };
});

vi.mock("../models/likes.models.js", () => {
    return {
        Like: {
            countDocuments: vi.fn(),
            findOne: vi.fn()
        }
    };
});

vi.mock("../models/subscriptions.model.js", () => {
    return {
        Subscription: {
            findOne: vi.fn()
        }
    };
});

vi.mock("../utils/asyncHandler.js", () => {
    return {
        default: (fn) => fn
    };
});

describe("getVideoById controller calculations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch video, increment views, update watch history, and return likes/sub status", async () => {
        const mockOwnerId = "6a5c95d5f987ab61a2ec9749";
        const mockVideoId = "6a5c963ff987ab61a2ec974f";
        const mockUserId = "6a5c96c8f987ab61a2ec9756";

        const mockOwner = {
            _id: mockOwnerId,
            fullName: "Creator Name",
            userName: "creator",
            avatar: "http://example.com/avatar.png"
        };

        const mockVideoObj = {
            _id: mockVideoId,
            title: "Test Video",
            description: "Test description",
            videoFile: "http://example.com/video.mp4",
            thumbnail: "http://example.com/thumb.jpg",
            views: 10,
            owner: mockOwner,
            save: vi.fn().mockResolvedValue(true),
            toObject: function() {
                return {
                    _id: mockVideoId,
                    title: "Test Video",
                    description: "Test description",
                    videoFile: "http://example.com/video.mp4",
                    thumbnail: "http://example.com/thumb.jpg",
                    views: this.views,
                    owner: mockOwner
                };
            }
        };

        Video.findById.mockReturnValue({
            populate: vi.fn().mockResolvedValue(mockVideoObj)
        });

        User.findByIdAndUpdate.mockResolvedValue({});
        Like.countDocuments.mockResolvedValue(5); // 5 likes
        Like.findOne.mockResolvedValue({ _id: "like_id" }); // User liked it
        Subscription.findOne.mockResolvedValue({ _id: "sub_id" }); // User is subscribed

        const req = {
            params: { videoId: mockVideoId },
            user: { _id: mockUserId }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await getVideoById(req, res);

        // Assert that video findById is called and populated
        expect(Video.findById).toHaveBeenCalledWith(mockVideoId);

        // Assert views are incremented and saved
        expect(mockVideoObj.views).toBe(11);
        expect(mockVideoObj.save).toHaveBeenCalled();

        // Assert User.findByIdAndUpdate is called to update watch history
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUserId,
            { $addToSet: { watchHistory: mockVideoId } }
        );

        // Assert response returns data including calculated parameters
        expect(res.status).toHaveBeenCalledWith(200);
        const jsonCalls = res.json.mock.calls;
        expect(jsonCalls.length).toBe(1);
        const responseData = jsonCalls[0][0].data;

        expect(responseData.views).toBe(11);
        expect(responseData.likesCount).toBe(5);
        expect(responseData.isLiked).toBe(true);
        expect(responseData.owner.isSubscribed).toBe(true);
    });
});
