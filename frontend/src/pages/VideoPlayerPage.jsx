import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { toggleVideoLike } from "../api/like.api";
import { toggleSubscription } from "../api/subscription.api";
import { getVideoComments, addComment, deleteComment } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiThumbsUp, FiBell, FiSend, FiTrash2, FiEye } from "react-icons/fi";
import "./VideoPlayerPage.css";

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function VideoPlayerPage() {
    const { videoId } = useParams();
    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [subscribed, setSubscribed] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        loadVideo();
        loadComments();
    }, [videoId]);

    const loadVideo = async () => {
        setLoading(true);
        try {
            const res = await getVideoById(videoId);
            const v = res.data.data;
            setVideo(v);
            setLikeCount(v.likesCount || 0);
            setLiked(v.isLiked || false);
            setSubscribed(v.owner?.isSubscribed || false);
        } catch { toast.error("Failed to load video"); }
        finally { setLoading(false); }
    };

    const loadComments = async () => {
        try {
            const res = await getVideoComments(videoId);
            setComments(res.data.data?.docs || res.data.data || []);
        } catch { /* silent */ }
    };

    const handleLike = async () => {
        try {
            await toggleVideoLike(videoId);
            setLiked(!liked);
            setLikeCount((c) => liked ? c - 1 : c + 1);
        } catch { toast.error("Failed to toggle like"); }
    };

    const handleSubscribe = async () => {
        if (!video?.owner?._id) return;
        try {
            await toggleSubscription(video.owner._id);
            setSubscribed(!subscribed);
            toast.success(subscribed ? "Unsubscribed" : "Subscribed!");
        } catch { toast.error("Failed to toggle subscription"); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await addComment(videoId, { content: newComment });
            setNewComment("");
            toast.success("Comment added");
            loadComments();
        } catch { toast.error("Failed to add comment"); }
        finally { setCommentLoading(false); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            setComments((c) => c.filter((x) => x._id !== commentId));
            toast.success("Comment deleted");
        } catch { toast.error("Failed to delete comment"); }
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;
    if (!video) return <div className="empty-state"><h3>Video not found</h3></div>;

    return (
        <div className="video-player-page fade-in">
            <div className="player-main">
                <div className="player-wrapper">
                    <video
                        src={video.videoFile}
                        controls
                        className="video-element"
                        poster={video.thumbnail}
                    />
                </div>
                <h1 className="video-player-title">{video.title}</h1>
                <div className="video-player-meta">
                    <div className="video-author">
                        <Link to={`/channel/${video.owner?.userName}`}>
                            {video.owner?.avatar
                                ? <img src={video.owner.avatar} alt={video.owner.fullName} className="avatar avatar-md" />
                                : <div className="avatar avatar-md avatar-placeholder">{video.owner?.fullName?.[0]}</div>}
                        </Link>
                        <div>
                            <Link to={`/channel/${video.owner?.userName}`} className="author-name">{video.owner?.fullName}</Link>
                            <div className="video-views"><FiEye size={12} /> {video.views || 0} views</div>
                        </div>
                    </div>
                    <div className="video-actions">
                        <button className={`btn ${liked ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={handleLike}>
                            <FiThumbsUp /> {likeCount}
                        </button>
                        {user?._id !== video.owner?._id && (
                            <button className={`btn ${subscribed ? "btn-secondary" : "btn-primary"} btn-sm`} onClick={handleSubscribe}>
                                <FiBell /> {subscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        )}
                    </div>
                </div>
                {video.description && (
                    <div className="video-description card">
                        <p>{video.description}</p>
                    </div>
                )}

                {/* Comments */}
                <div className="comments-section">
                    <h2 className="comments-title">{comments.length} Comments</h2>
                    <form className="comment-form" onSubmit={handleComment}>
                        {user?.avatar
                            ? <img src={user.avatar} alt={user.fullName} className="avatar avatar-sm" />
                            : <div className="avatar avatar-sm avatar-placeholder">{user?.fullName?.[0]}</div>}
                        <input
                            type="text" className="form-input" placeholder="Add a comment..."
                            value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-icon" disabled={commentLoading || !newComment.trim()}>
                            <FiSend />
                        </button>
                    </form>
                    <div className="comments-list">
                        {comments.map((c) => (
                            <div key={c._id} className="comment-item">
                                {c.owner?.avatar
                                    ? <img src={c.owner.avatar} alt={c.owner.fullName} className="avatar avatar-sm" />
                                    : <div className="avatar avatar-sm avatar-placeholder">{c.owner?.fullName?.[0] || "?"}</div>}
                                <div className="comment-body">
                                    <div className="comment-header">
                                        <span className="comment-author">{c.owner?.fullName}</span>
                                        <span className="comment-time">{timeAgo(c.createdAt)}</span>
                                    </div>
                                    <p className="comment-content">{c.content}</p>
                                </div>
                                {user?._id === c.owner?._id && (
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDeleteComment(c._id)}>
                                        <FiTrash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
