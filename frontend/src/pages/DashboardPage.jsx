import { useState, useEffect } from "react";
import { getChannelStats, getChannelVideos } from "../api/dashboard.api";
import { togglePublishStatus, deleteVideo } from "../api/video.api";
import toast from "react-hot-toast";
import { FiEye, FiHeart, FiUsers, FiVideo, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";
import "./DashboardPage.css";

function StatCard({ icon, label, value, color }) {
    return (
        <div className="stat-card card">
            <div className="stat-icon" style={{ color }}>{icon}</div>
            <div className="stat-value">{value ?? "-"}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [sRes, vRes] = await Promise.all([getChannelStats(), getChannelVideos()]);
                setStats(sRes.data.data);
                setVideos(vRes.data.data || []);
            } catch { toast.error("Failed to load dashboard"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleToggle = async (videoId) => {
        try {
            await togglePublishStatus(videoId);
            setVideos(v => v.map(x => x._id === videoId ? { ...x, isPublished: !x.isPublished } : x));
            toast.success("Publish status updated");
        } catch { toast.error("Failed to toggle"); }
    };

    const handleDelete = async (videoId) => {
        if (!confirm("Delete this video?")) return;
        try {
            await deleteVideo(videoId);
            setVideos(v => v.filter(x => x._id !== videoId));
            toast.success("Video deleted");
        } catch { toast.error("Failed to delete"); }
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div className="dashboard-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Your channel analytics at a glance</p>
            </div>
            <div className="stats-grid">
                <StatCard icon={<FiEye size={24} />} label="Total Views" value={stats?.totalViews?.toLocaleString()} color="var(--accent2)" />
                <StatCard icon={<FiUsers size={24} />} label="Subscribers" value={stats?.totalSubscribers?.toLocaleString()} color="#22c55e" />
                <StatCard icon={<FiHeart size={24} />} label="Total Likes" value={stats?.totalLikes?.toLocaleString()} color="#f43f5e" />
                <StatCard icon={<FiVideo size={24} />} label="Videos" value={stats?.totalVideos?.toLocaleString()} color="#f59e0b" />
            </div>

            <div className="dashboard-section">
                <h2 className="section-title">Your Videos</h2>
                {videos.length === 0 ? (
                    <div className="empty-state"><h3>No videos yet</h3></div>
                ) : (
                    <div className="videos-table-wrap card">
                        <table className="videos-table">
                            <thead>
                                <tr>
                                    <th>Video</th>
                                    <th>Views</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map(v => (
                                    <tr key={v._id}>
                                        <td>
                                            <div className="table-video-cell">
                                                <img src={v.thumbnail} alt={v.title} className="table-thumb" onError={e => { e.target.src = "https://placehold.co/80x45/111118/5a5a7a?text=No+Thumb"; }} />
                                                <div>
                                                    <div className="table-video-title">{v.title}</div>
                                                    <div className="table-video-date">{new Date(v.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-views">{(v.views || 0).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${v.isPublished ? "badge-green" : "badge-red"}`}>
                                                {v.isPublished ? "Published" : "Private"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(v._id)} title="Toggle publish">
                                                    {v.isPublished ? <FiToggleRight size={18} color="var(--green)" /> : <FiToggleLeft size={18} />}
                                                </button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(v._id)} title="Delete">
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
