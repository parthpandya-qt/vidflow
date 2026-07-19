import "dotenv/config";
import http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

import connectDB from "./db.js";
import { searchVideos } from "./tools/searchVideos.js";
import { getChannelStats } from "./tools/getChannelStats.js";
import { getWatchHistory } from "./tools/getWatchHistory.js";
import { getVideoComments } from "./tools/getVideoComments.js";
import { postTweet } from "./tools/postTweet.js";

// ── MCP Server ─────────────────────────────────────────────────────────────────
const server = new McpServer({
    name: "vidflow-mcp",
    version: "1.0.0",
    description: "VidFlow MCP server — search videos, get channel stats, watch history, comments and post tweets"
});

// ── Tool: search_videos ────────────────────────────────────────────────────────
server.tool(
    "search_videos",
    "Search VidFlow videos by keyword in title or description. Returns top results sorted by views.",
    {
        query: z.string().min(1).describe("Search keyword"),
        limit: z.number().int().min(1).max(20).default(5).describe("Max results to return (default 5, max 20)")
    },
    async ({ query, limit }) => {
        const result = await searchVideos({ query, limit });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
);

// ── Tool: get_channel_stats ────────────────────────────────────────────────────
server.tool(
    "get_channel_stats",
    "Get aggregate stats for a VidFlow channel: total videos, subscribers, and likes.",
    {
        username: z.string().min(1).describe("Channel's userName (e.g. 'johndoe')")
    },
    async ({ username }) => {
        const result = await getChannelStats({ username });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
);

// ── Tool: get_watch_history ────────────────────────────────────────────────────
server.tool(
    "get_watch_history",
    "Fetch the watch history of a VidFlow user by their username.",
    {
        username: z.string().min(1).describe("User's userName"),
        limit: z.number().int().min(1).max(50).default(10).describe("Max history items to return (default 10)")
    },
    async ({ username, limit }) => {
        const result = await getWatchHistory({ username, limit });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
);

// ── Tool: get_video_comments ───────────────────────────────────────────────────
server.tool(
    "get_video_comments",
    "Get comments on a VidFlow video. Find the video by a title keyword.",
    {
        videoTitle: z.string().min(1).describe("Partial or full video title to search for"),
        limit: z.number().int().min(1).max(50).default(10).describe("Max comments to return (default 10)")
    },
    async ({ videoTitle, limit }) => {
        const result = await getVideoComments({ videoTitle, limit });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
);

// ── Tool: post_tweet ───────────────────────────────────────────────────────────
server.tool(
    "post_tweet",
    "Post a community tweet in VidFlow on behalf of a user (identified by username).",
    {
        username: z.string().min(1).describe("The user's userName"),
        content: z.string().min(1).max(500).describe("Tweet content (max 500 characters)")
    },
    async ({ username, content }) => {
        const result = await postTweet({ username, content });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
);

// ── SSE HTTP Server (browser-accessible) ──────────────────────────────────────
// Keep a map of active transports keyed by session ID
const transports = {};

const httpServer = http.createServer(async (req, res) => {
    // CORS headers so the browser chat widget can connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // GET /sse  — browser opens an SSE stream here to receive MCP messages
    if (req.method === "GET" && url.pathname === "/sse") {
        const transport = new SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;
        res.on("close", () => delete transports[transport.sessionId]);
        await server.connect(transport);
        return;
    }

    // POST /messages?sessionId=…  — browser posts MCP requests here
    if (req.method === "POST" && url.pathname === "/messages") {
        const sessionId = url.searchParams.get("sessionId");
        const transport = transports[sessionId];
        if (!transport) {
            res.writeHead(404);
            res.end("Session not found");
            return;
        }
        await transport.handlePostMessage(req, res);
        return;
    }

    // Health-check
    if (req.method === "GET" && url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", server: "vidflow-mcp", version: "1.0.0" }));
        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

// ── Bootstrap ──────────────────────────────────────────────────────────────────
const PORT = process.env.MCP_PORT || 4001;

(async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.error(`[MCP] VidFlow MCP server running on http://localhost:${PORT}`);
        console.error(`[MCP] SSE endpoint: http://localhost:${PORT}/sse`);
        console.error(`[MCP] Messages endpoint: http://localhost:${PORT}/messages`);
        console.error(`[MCP] Health check: http://localhost:${PORT}/health`);
    });
})();
