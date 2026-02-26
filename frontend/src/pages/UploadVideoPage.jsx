import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishAVideo } from "../api/video.api";
import toast from "react-hot-toast";
import { FiUpload, FiVideo, FiImage } from "react-icons/fi";
import "./UploadVideoPage.css";

export default function UploadVideoPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", description: "" });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFile = (e, setter, previewSetter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file);
            if (previewSetter) previewSetter(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) return toast.error("Please select a video file");
        if (!thumbnail) return toast.error("Please select a thumbnail");
        setLoading(true);
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("videoFile", videoFile);
        fd.append("thumbnail", thumbnail);
        try {
            await publishAVideo(fd);
            toast.success("Video published successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="upload-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Upload Video</h1>
                <p className="page-subtitle">Share your content with the world</p>
            </div>
            <div className="upload-layout">
                <div className="upload-form-card card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input type="text" className="form-input" placeholder="Enter video title"
                                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" placeholder="Describe your video..." rows={4}
                                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div className="upload-files-grid">
                            <div className="form-group">
                                <label className="form-label">Video File *</label>
                                <div className={`upload-drop-zone ${videoFile ? "has-file" : ""}`}
                                    onClick={() => document.getElementById("video-input").click()}>
                                    <FiVideo size={28} />
                                    <span>{videoFile ? videoFile.name : "Click to select video"}</span>
                                    <span className="upload-hint">MP4, WebM, MOV supported</span>
                                </div>
                                <input id="video-input" type="file" accept="video/*" style={{ display: "none" }}
                                    onChange={(e) => handleFile(e, setVideoFile, null)} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Thumbnail *</label>
                                <div className={`upload-drop-zone ${thumbnail ? "has-file" : ""}`}
                                    onClick={() => document.getElementById("thumb-input").click()}>
                                    {thumbnailPreview
                                        ? <img src={thumbnailPreview} alt="thumbnail preview" className="thumb-preview" />
                                        : <><FiImage size={28} /><span>Click to select thumbnail</span><span className="upload-hint">JPG, PNG, WebP</span></>}
                                </div>
                                <input id="thumb-input" type="file" accept="image/*" style={{ display: "none" }}
                                    onChange={(e) => handleFile(e, setThumbnail, setThumbnailPreview)} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
                            <FiUpload /> {loading ? "Uploading..." : "Publish Video"}
                        </button>
                    </form>
                </div>

                <div className="upload-tips card">
                    <h3 className="upload-tips-title">Tips for great videos</h3>
                    <ul className="upload-tips-list">
                        <li>✨ Use a clear, descriptive title</li>
                        <li>🖼️ Eye-catching thumbnails get more clicks</li>
                        <li>📝 Write a helpful description</li>
                        <li>🎬 Good lighting makes a huge difference</li>
                        <li>🔊 Clear audio keeps viewers engaged</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
