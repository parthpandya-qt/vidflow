import { useState, useEffect } from "react";
import { getUserTweets, createTweet, updateTweet, deleteTweet } from "../api/tweet.api";
import { toggleTweetLike } from "../api/like.api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiHeart, FiSend } from "react-icons/fi";
import "./TweetsPage.css";

function timeAgo(d) {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

export default function TweetsPage() {
    const { user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [editId, setEditId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (user?._id) loadTweets();
    }, [user]);

    const loadTweets = async () => {
        setLoading(true);
        try {
            const res = await getUserTweets(user._id);
            setTweets(res.data.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setPosting(true);
        try {
            await createTweet({ content });
            setContent("");
            toast.success("Tweet posted!");
            loadTweets();
        } catch { toast.error("Failed to post"); }
        finally { setPosting(false); }
    };

    const handleEdit = async (id) => {
        if (!editContent.trim()) return;
        try {
            await updateTweet(id, { content: editContent });
            setTweets(t => t.map(x => x._id === id ? { ...x, content: editContent } : x));
            setEditId(null);
            toast.success("Tweet updated!");
        } catch { toast.error("Failed to update"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete tweet?")) return;
        try {
            await deleteTweet(id);
            setTweets(t => t.filter(x => x._id !== id));
            toast.success("Tweet deleted");
        } catch { toast.error("Failed to delete"); }
    };

    const handleLike = async (id) => {
        try {
            await toggleTweetLike(id);
            setTweets(t => t.map(x => x._id === id ? { ...x, isLiked: !x.isLiked, likesCount: x.isLiked ? (x.likesCount || 1) - 1 : (x.likesCount || 0) + 1 } : x));
        } catch { /* silent */ }
    };

    return (
        <div className="tweets-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Community</h1>
                <p className="page-subtitle">Share thoughts with your audience</p>
            </div>

            <div className="tweet-compose card">
                <div className="tweet-compose-header">
                    {user?.avatar
                        ? <img src={user.avatar} alt={user.fullName} className="avatar avatar-md" />
                        : <div className="avatar avatar-md avatar-placeholder">{user?.fullName?.[0]}</div>}
                    <form className="tweet-form" onSubmit={handlePost}>
                        <textarea className="form-input tweet-input" placeholder="What's on your mind?"
                            value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
                        <div className="tweet-form-footer">
                            <span className="tweet-char-count">{content.length}/500</span>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={posting || !content.trim()}>
                                <FiSend /> {posting ? "Posting..." : "Tweet"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : (
                <div className="tweets-list">
                    {tweets.length === 0 ? (
                        <div className="empty-state"><h3>No tweets yet</h3><p>Start sharing with your audience</p></div>
                    ) : tweets.map(tweet => (
                        <div key={tweet._id} className="tweet-card card">
                            <div className="tweet-card-header">
                                {user?.avatar
                                    ? <img src={user.avatar} alt={user.fullName} className="avatar avatar-md" />
                                    : <div className="avatar avatar-md avatar-placeholder">{user?.fullName?.[0]}</div>}
                                <div className="tweet-meta">
                                    <span className="tweet-author">{user?.fullName}</span>
                                    <span className="tweet-time">@{user?.userName} · {timeAgo(tweet.createdAt)}</span>
                                </div>
                                <div className="tweet-card-actions">
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditId(tweet._id); setEditContent(tweet.content); }}>
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(tweet._id)}>
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {editId === tweet._id ? (
                                <div className="tweet-edit">
                                    <textarea className="form-input" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} />
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleEdit(tweet._id)}>Save</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="tweet-content">{tweet.content}</p>
                            )}
                            <div className="tweet-footer">
                                <button className={`btn btn-ghost btn-sm ${tweet.isLiked ? "liked" : ""}`} onClick={() => handleLike(tweet._id)}>
                                    <FiHeart size={14} fill={tweet.isLiked ? "currentColor" : "none"} /> {tweet.likesCount || 0}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
