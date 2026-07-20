import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import "./ChatWidget.css";

const MCP_BASE = import.meta.env.VITE_MCP_BASE_URL || "http://localhost:4001";

// ── Suggested prompts shown when chat is empty ────────────────────────────────
const SUGGESTIONS = [
    "Search for JavaScript tutorials",
    "Show me my channel stats",
    "What's in my watch history?",
    "Get comments on a video",
];

// ── Parse MCP tool result JSON into a friendly message ───────────────────────
function formatMcpResponse(text) {
    try {
        const data = JSON.parse(text);

        // searchVideos
        if (data.results) {
            if (data.count === 0 || data.results.length === 0) return data.message || "No videos found.";
            return `Found **${data.count}** video(s):\n\n` +
                data.results.map((v, i) =>
                    `${i + 1}. **${v.title}**\n   👁 ${v.views} views · ⏱ ${Math.floor(v.duration / 60)}m · by ${v.channel}`
                ).join("\n\n");
        }

        // getChannelStats
        if (data.channel && data.stats) {
            const s = data.stats;
            return `📺 **${data.channel.fullName}** (@${data.channel.userName})\n` +
                `📹 ${s.totalVideos} videos · 👥 ${s.totalSubscribers} subscribers · ❤️ ${s.totalLikes} likes`;
        }

        // getWatchHistory
        if (data.history) {
            if (data.history.length === 0) return data.message || "No watch history found.";
            return `📋 **Watch History** (${data.count} items):\n\n` +
                data.history.map((v, i) =>
                    `${i + 1}. **${v.title}** · by ${v.channel}`
                ).join("\n");
        }

        // getVideoComments
        if (data.comments) {
            if (data.comments.length === 0) return "No comments found for that video.";
            return `💬 **${data.video?.title}** — ${data.commentCount} comment(s):\n\n` +
                data.comments.slice(0, 5).map((c) =>
                    `• **${c.author}**: ${c.content}`
                ).join("\n");
        }

        // postTweet
        if (data.tweet) {
            return `✅ Tweet posted!\n"${data.tweet.content}"\n— ${data.tweet.author}`;
        }

        // error
        if (data.error) return `⚠️ ${data.error}`;

        // fallback pretty JSON
        return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
    } catch {
        return text;
    }
}

// ── Natural language → tool call mapping ──────────────────────────────────────
function parseIntent(message, currentUsername = "testuser2") {
    const msg = message.toLowerCase().trim();

    // post_tweet
    const tweetMatch = msg.match(/(?:post|tweet|send)\s+(?:a\s+)?(?:tweet|post)(?:\s+for\s+@?(\w+))?\s*[:"']?\s*(.+)/i);
    if (tweetMatch) {
        return { tool: "post_tweet", args: { username: tweetMatch[1] || currentUsername, content: tweetMatch[2] || message } };
    }

    // get_channel_stats
    const statsMatch = msg.match(/(?:stats?|analytics?|channel|info)\s+(?:for\s+|of\s+)?@?(\w+)/i);
    if (statsMatch) {
        return { tool: "get_channel_stats", args: { username: statsMatch[1] } };
    }
    if (msg.includes("my channel stats") || msg.includes("my stats")) {
        return { tool: "get_channel_stats", args: { username: currentUsername } };
    }

    // get_watch_history
    if (msg.includes("watch history") || msg.includes("what i watched") || msg.includes("history")) {
        const userMatch = msg.match(/(?:for|of)\s+@?(\w+)/i);
        return { tool: "get_watch_history", args: { username: userMatch?.[1] || currentUsername, limit: 10 } };
    }

    // get_video_comments
    const commentsMatch = msg.match(/comments?\s+(?:on|for|about)\s+(?:video\s+)?['""]?(.+?)['""]?$/i);
    if (commentsMatch || msg.includes("comments")) {
        const videoTitle = commentsMatch?.[1] || msg.replace(/.*comments?\s+/i, "").trim() || "tutorial";
        return { tool: "get_video_comments", args: { videoTitle, limit: 5 } };
    }

    // search_videos (default)
    const searchMatch = msg.match(/(?:search|find|show|look up)\s+(?:for\s+)?(.+)/i);
    const query = searchMatch?.[1] || message;
    return { tool: "search_videos", args: { query, limit: 5 } };
}

// ── MCP Client helpers ────────────────────────────────────────────────────────
let _sessionId = null;
let _sseEventSource = null;
const _pendingRequests = new Map(); // msgId → { resolve, reject }
let _msgIdCounter = 1;

function openSseConnection() {
    return new Promise((resolve, reject) => {
        if (_sseEventSource && _sseEventSource.readyState === EventSource.OPEN && _sessionId) {
            resolve(_sessionId);
            return;
        }
        if (_sseEventSource) {
            try { _sseEventSource.close(); } catch {}
        }
        const es = new EventSource(`${MCP_BASE}/sse`);
        _sseEventSource = es;

        es.addEventListener("message", (evt) => {
            try {
                const data = JSON.parse(evt.data);
                const pending = _pendingRequests.get(data.id);
                if (pending) {
                    _pendingRequests.delete(data.id);
                    if (data.error) pending.reject(new Error(data.error.message));
                    else pending.resolve(data.result);
                }
            } catch { /* ignore */ }
        });

        es.addEventListener("endpoint", (evt) => {
            const postUrl = new URL(evt.data, MCP_BASE);
            _sessionId = postUrl.searchParams.get("sessionId");
            resolve(_sessionId);
        });

        es.onerror = (err) => {
            _sessionId = null;
            reject(new Error("SSE connection failed"));
        };
    });
}

async function callMcpTool(toolName, toolArgs) {
    await openSseConnection();

    const msgId = _msgIdCounter++;
    const payload = {
        jsonrpc: "2.0",
        id: msgId,
        method: "tools/call",
        params: { name: toolName, arguments: toolArgs }
    };

    return new Promise((resolve, reject) => {
        _pendingRequests.set(msgId, { resolve, reject });

        fetch(`${MCP_BASE}/messages?sessionId=${_sessionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch((err) => {
            _pendingRequests.delete(msgId);
            reject(err);
        });

        // Timeout after 30s
        setTimeout(() => {
            if (_pendingRequests.has(msgId)) {
                _pendingRequests.delete(msgId);
                reject(new Error("Request timed out"));
            }
        }, 30000);
    });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatWidget() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 0, role: "assistant", text: "👋 Hi! I'm the **VidFlow AI assistant**. I can search videos, show channel stats, fetch your watch history, and more!" }
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const addMessage = useCallback((role, text) => {
        setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
    }, []);

    const handleSend = useCallback(async (text) => {
        const userText = (text ?? input).trim();
        if (!userText) return;
        setInput("");
        setError(null);
        addMessage("user", userText);
        setTyping(true);

        try {
            const intent = parseIntent(userText, user?.userName);
            const result = await callMcpTool(intent.tool, intent.args);

            // result.content is an array of { type, text } from the MCP SDK
            const rawText = result?.content?.[0]?.text ?? JSON.stringify(result);
            const friendly = formatMcpResponse(rawText);
            addMessage("assistant", friendly);
        } catch (err) {
            setError(err.message || "Something went wrong. Is the MCP server running?");
            addMessage("assistant", "⚠️ I couldn't connect to the server. Make sure the MCP server is running on port 4001.");
        } finally {
            setTyping(false);
        }
    }, [input, addMessage, user?.userName]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown bold renderer
    const renderText = (text) =>
        text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
        );

    return (
        <>
            {/* Floating action button */}
            <button
                id="chat-fab-btn"
                className="chat-fab"
                onClick={() => setOpen((o) => !o)}
                title="Open AI Chat"
                aria-label="Open AI chat widget"
            >
                {open
                    ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                    : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                }
            </button>

            {/* Chat panel */}
            {open && (
                <div className="chat-widget" role="dialog" aria-label="VidFlow AI chat">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <div className="chat-title">VidFlow AI</div>
                                <div className="chat-subtitle">● Online</div>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-msg ${msg.role}`}>
                                <div className={`msg-avatar ${msg.role === "user" ? "user-av" : ""}`}>
                                    {msg.role === "assistant" ? "🤖" : "👤"}
                                </div>
                                <div className="msg-bubble">
                                    {renderText(msg.text)}
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="chat-msg assistant">
                                <div className="msg-avatar">🤖</div>
                                <div className="msg-bubble">
                                    <div className="typing-dots">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestions (shown only when conversation is short) */}
                    {messages.length <= 2 && (
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} className="chip-btn" onClick={() => handleSend(s)}>{s}</button>
                            ))}
                        </div>
                    )}

                    {error && <div className="chat-error">{error}</div>}

                    {/* Input */}
                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            id="chat-input-field"
                            className="chat-input"
                            rows={1}
                            placeholder="Ask me anything about VidFlow…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={typing}
                        />
                        <button
                            id="chat-send-btn"
                            className="chat-send-btn"
                            onClick={() => handleSend()}
                            disabled={typing || !input.trim()}
                            aria-label="Send message"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
