import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlaylistById } from "../api/playlist.api";
import VideoCard from "../components/VideoCard";
import { FiArrowLeft, FiList } from "react-icons/fi";

export default function PlaylistViewPage() {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPlaylistById(playlistId)
            .then(res => setPlaylist(res.data.data))
            .catch(() => setPlaylist(null))
            .finally(() => setLoading(false));
    }, [playlistId]);

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;
    if (!playlist) return <div className="empty-state"><h3>Playlist not found</h3></div>;

    return (
        <div className="fade-in">
            <Link to="/playlists" className="btn btn-ghost btn-sm" style={{ marginBottom: 20, display: "inline-flex" }}>
                <FiArrowLeft /> Back to Playlists
            </Link>
            <div className="page-header">
                <h1 className="page-title">{playlist.name}</h1>
                {playlist.description && <p className="page-subtitle">{playlist.description}</p>}
            </div>
            {playlist.videos?.length === 0 ? (
                <div className="empty-state">
                    <FiList style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} />
                    <h3>Playlist is empty</h3>
                </div>
            ) : (
                <div className="video-grid">
                    {playlist.videos?.map(v => <VideoCard key={v._id} video={v} />)}
                </div>
            )}
        </div>
    );
}
