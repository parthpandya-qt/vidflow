import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loginUser } from "./users.controller.js";
import { User } from "../models/users.model.js";
import jwt from "jsonwebtoken";

vi.mock("../models/users.model.js", () => {
    return {
        User: {
            findOne: vi.fn(),
            findById: vi.fn()
        }
    };
});

vi.mock("../utils/asyncHandler.js", () => {
    return {
        default: (fn) => fn
    };
});

describe("loginUser cookie options", () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = process.env.NODE_ENV;
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it("should set sameSite to 'lax' in development environment", async () => {
        process.env.NODE_ENV = "development";
        process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
        process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";

        const mockUser = {
            _id: "mock_id",
            userName: "testuser",
            email: "test@gmail.com",
            isPasswordCorrect: vi.fn().mockResolvedValue(true),
            generateAccessToken: vi.fn().mockReturnValue("mock_access_token"),
            generateRefreshToken: vi.fn().mockReturnValue("mock_refresh_token"),
            save: vi.fn().mockResolvedValue(true)
        };

        User.findOne.mockResolvedValue(mockUser);
        
        // Handle both findById calls (direct for token, and chained .select for login response)
        const selectMock = vi.fn().mockResolvedValue({
            _id: "mock_id",
            userName: "testuser",
            email: "test@gmail.com"
        });
        
        User.findById.mockImplementation((id) => {
            // Return an object that has both the mock user properties (for direct calls)
            // and the .select chaining mechanism
            return {
                ...mockUser,
                select: selectMock,
                then: (resolve) => resolve(mockUser)
            };
        });

        const req = {
            body: {
                email: "test@gmail.com",
                password: "password123"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            cookie: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await loginUser(req, res);

        // Check if res.cookie was called with development options (sameSite: "lax", secure: false)
        const cookieCalls = res.cookie.mock.calls;
        expect(cookieCalls.length).toBe(2);

        // First cookie (accessToken)
        const [, , options1] = cookieCalls[0];
        expect(options1.sameSite).toBe("lax");
        expect(options1.secure).toBe(false);

        // Second cookie (refreshToken)
        const [, , options2] = cookieCalls[1];
        expect(options2.sameSite).toBe("lax");
        expect(options2.secure).toBe(false);
    });
});
