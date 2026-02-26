import { Link } from "react-router-dom";
import { FiEye, FiClock } from "react-icons/fi";
import "./VideoCard.css";

function formatDuration(seconds) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(views) {
    if (!views) return "0 views";
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
    return `${views} views`;
}

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function VideoCard({ video }) {
    return (
        <Link to={`/video/${video._id}`} className="video-card">
            <div className="video-thumbnail-wrapper">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="video-thumbnail"
                    onError={(e) => { e.target.src = "https://placehold.co/320x180/111118/5a5a7a?text=No+Thumbnail"; }}
                />
                {video.duration && (
                    <span className="video-duration">{formatDuration(video.duration)}</span>
                )}
            </div>
            <div className="video-info">
                <div className="video-owner">
                    {video.owner?.avatar ? (
                        <img src={video.owner.avatar} alt={video.owner.fullName} className="avatar avatar-sm" />
                    ) : (
                        <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: 12 }}>
                            {video.owner?.fullName?.[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                </div>
                <div className="video-meta">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-channel">{video.owner?.fullName || "Unknown"}</p>
                    <div className="video-stats">
                        <span><FiEye size={12} /> {formatViews(video.views)}</span>
                        {video.createdAt && <span><FiClock size={12} /> {timeAgo(video.createdAt)}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}
