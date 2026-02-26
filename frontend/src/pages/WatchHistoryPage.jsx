import { useState, useEffect } from "react";
import { getUserwatchHistory } from "../api/auth.api";
import VideoCard from "../components/VideoCard";
import { FiClock } from "react-icons/fi";

export default function WatchHistoryPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserwatchHistory()
            .then(res => setVideos(res.data.data || []))
            .catch(() => setVideos([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Watch History</h1>
                <p className="page-subtitle">Videos you've watched recently</p>
            </div>
            {loading ? <div className="loading-center"><div className="spinner" /></div> :
                videos.length === 0 ? (
                    <div className="empty-state">
                        <FiClock style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} />
                        <h3>No watch history</h3>
                        <p>Videos you watch will appear here</p>
                    </div>
                ) : <div className="video-grid">{videos.map(v => <VideoCard key={v._id} video={v} />)}</div>
            }
        </div>
    );
}
