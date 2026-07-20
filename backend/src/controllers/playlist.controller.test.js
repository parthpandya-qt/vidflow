import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPlaylist, getUserPlaylists, getPlaylistById } from "./playlist.controller.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/users.model.js";

vi.mock("../models/playlist.model.js", () => {
    return {
        Playlist: {
            create: vi.fn(),
            find: vi.fn(),
            findById: vi.fn()
        }
    };
});

vi.mock("../models/users.model.js", () => {
    return {
        User: {
            findById: vi.fn()
        }
    };
});

vi.mock("../utils/asyncHandler.js", () => {
    return {
        default: (fn) => fn
    };
});

describe("Playlist Controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("createPlaylist should successfully create a playlist with name and description", async () => {
        const mockPlaylist = {
            _id: "60c72b2f9b1d8b2a4c8e4b01",
            name: "My Favorites",
            description: "Favorite videos",
            owner: "60c72b2f9b1d8b2a4c8e4b00"
        };
        Playlist.create.mockResolvedValue(mockPlaylist);

        const req = {
            body: { name: "My Favorites", description: "Favorite videos" },
            user: { _id: "60c72b2f9b1d8b2a4c8e4b00" }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await createPlaylist(req, res);

        expect(Playlist.create).toHaveBeenCalledWith({
            name: "My Favorites",
            description: "Favorite videos",
            owner: "60c72b2f9b1d8b2a4c8e4b00"
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 200,
                message: "playlist created successfully"
            })
        );
    });

    it("getUserPlaylists should return playlists for a valid user", async () => {
        const userId = "60c72b2f9b1d8b2a4c8e4b00";
        User.findById.mockResolvedValue({ _id: userId });

        const selectMock = vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue([
                { _id: "p1", name: "Playlist 1" }
            ])
        });
        Playlist.find.mockReturnValue({ select: selectMock });

        const req = { params: { userId } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await getUserPlaylists(req, res);

        expect(User.findById).toHaveBeenCalledWith(userId);
        expect(Playlist.find).toHaveBeenCalledWith({ owner: userId });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
