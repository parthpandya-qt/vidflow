import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/VideoCard";
import { FiSearch, FiVideo } from "react-icons/fi";
import "./HomePage.css";

export default function HomePage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const search = searchParams.get("search") || "";

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search) params.query = search;
                const res = await getAllVideos(params);
                setVideos(res.data.data?.docs || res.data.data || []);
            } catch {
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [search]);

    return (
        <div className="fade-in">
            <div className="page-header">
                {search
                    ? <><h1 className="page-title">Search: "{search}"</h1><p className="page-subtitle">{videos.length} result{videos.length !== 1 ? "s" : ""} found</p></>
                    : <><h1 className="page-title">Explore Videos</h1><p className="page-subtitle">Discover the latest content from creators</p></>}
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : videos.length === 0 ? (
                <div className="empty-state">
                    {search ? <FiSearch style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} /> : <FiVideo style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} />}
                    <h3>{search ? "No videos found" : "No videos yet"}</h3>
                    <p>{search ? `No results for "${search}"` : "Be the first to upload!"}</p>
                </div>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => <VideoCard key={video._id} video={video} />)}
                </div>
            )}
        </div>
    );
}
