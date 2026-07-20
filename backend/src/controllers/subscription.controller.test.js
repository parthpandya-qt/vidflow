import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubscribedChannels, getUserChannelSubscribers } from "./subscription.controller.js";
import { Subscription } from "../models/subscriptions.model.js";

vi.mock("../models/subscriptions.model.js", () => {
    return {
        Subscription: {
            aggregate: vi.fn()
        }
    };
});

vi.mock("../utils/asyncHandler.js", () => {
    return {
        default: (fn) => fn
    };
});

describe("Subscription Controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getSubscribedChannels should fetch channels for valid subscriberId", async () => {
        const validId = "60c72b2f9b1d8b2a4c8e4b0a";
        const mockChannels = [
            { channelId: "60c72b2f9b1d8b2a4c8e4b0b", userName: "channel1", avatar: "avatar1.png" }
        ];

        Subscription.aggregate.mockResolvedValue(mockChannels);

        const req = { params: { subscriberId: validId } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await getSubscribedChannels(req, res);

        expect(Subscription.aggregate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 200,
                data: mockChannels,
                message: "subscribed channels fetched"
            })
        );
    });

    it("getUserChannelSubscribers should fetch subscribers for valid channelId", async () => {
        const validId = "60c72b2f9b1d8b2a4c8e4b0a";
        const mockSubscribers = [
            { subscriberId: "60c72b2f9b1d8b2a4c8e4b0c", userName: "sub1", avatar: "avatar2.png" }
        ];

        Subscription.aggregate.mockResolvedValue(mockSubscribers);

        const req = { params: { channelId: validId } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await getUserChannelSubscribers(req, res);

        expect(Subscription.aggregate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 200,
                data: mockSubscribers,
                message: "all the subscribers fetched"
            })
        );
    });
});
