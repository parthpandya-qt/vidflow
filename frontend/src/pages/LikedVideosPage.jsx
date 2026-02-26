import { useState, useEffect } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/VideoCard";
import { FiHeart } from "react-icons/fi";

export default function LikedVideosPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLikedVideos()
            .then(res => setVideos(res.data.data || []))
            .catch(() => setVideos([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Liked Videos</h1>
                <p className="page-subtitle">Videos you've liked</p>
            </div>
            {loading ? <div className="loading-center"><div className="spinner" /></div> :
                videos.length === 0 ? (
                    <div className="empty-state">
                        <FiHeart style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} />
                        <h3>No liked videos</h3>
                        <p>Like videos to find them here</p>
                    </div>
                ) : <div className="video-grid">{videos.map(v => <VideoCard key={v._id} video={v.video || v} />)}</div>
            }
        </div>
    );
}
