import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPlaylists, createPlaylist, deletePlaylist } from "../api/playlist.api";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiList, FiX } from "react-icons/fi";
import "./PlaylistsPage.css";

export default function PlaylistsPage() {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", description: "" });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (user?._id) load();
    }, [user]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getUserPlaylists(user._id);
            setPlaylists(res.data.data || []);
        } catch { toast.error("Failed to load playlists"); }
        finally { setLoading(false); }
    };


    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createPlaylist(form);
            setForm({ name: "", description: "" });
            setShowCreate(false);
            toast.success("Playlist created!");
            load();
        } catch { toast.error("Failed to create playlist"); }
        finally { setCreating(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this playlist?")) return;
        try {
            await deletePlaylist(id);
            setPlaylists(p => p.filter(x => x._id !== id));
            toast.success("Playlist deleted");
        } catch { toast.error("Failed to delete"); }
    };

    return (
        <div className="playlists-page fade-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="page-title">Playlists</h1>
                    <p className="page-subtitle">Organize your favorite videos</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <FiPlus /> New Playlist
                </button>
            </div>

            {showCreate && (
                <div className="create-playlist-modal">
                    <div className="modal-backdrop" onClick={() => setShowCreate(false)} />
                    <div className="modal-card card">
                        <div className="modal-header">
                            <h2>Create Playlist</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-input" placeholder="My Playlist"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" placeholder="What's in this playlist?"
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={creating}>
                                <FiPlus /> {creating ? "Creating..." : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? <div className="loading-center"><div className="spinner" /></div> :
                playlists.length === 0 ? (
                    <div className="empty-state">
                        <FiList style={{ fontSize: 48, display: "block", margin: "0 auto 16px" }} />
                        <h3>No playlists yet</h3>
                        <p>Create a playlist to get started</p>
                    </div>
                ) : (
                    <div className="playlists-grid">
                        {playlists.map(pl => (
                            <div key={pl._id} className="playlist-card card">
                                <Link to={`/playlist/${pl._id}`} className="playlist-thumb">
                                    {pl.videos?.[0]?.thumbnail
                                        ? <img src={pl.videos[0].thumbnail} alt={pl.name} className="playlist-thumb-img" />
                                        : <div className="playlist-thumb-placeholder"><FiList size={32} /></div>}
                                    <div className="playlist-count">{pl.videos?.length || 0} videos</div>
                                </Link>
                                <div className="playlist-info">
                                    <Link to={`/playlist/${pl._id}`} className="playlist-name">{pl.name}</Link>
                                    {pl.description && <p className="playlist-desc">{pl.description}</p>}
                                </div>
                                <button className="btn btn-danger btn-icon btn-sm playlist-delete" onClick={() => handleDelete(pl._id)}>
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
