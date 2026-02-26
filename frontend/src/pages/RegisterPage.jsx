import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiImage, FiUserPlus } from "react-icons/fi";
import "./AuthPage.css";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: "", email: "", userName: "", password: "" });
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFile = (e, setter, previewSetter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file);
            if (previewSetter) previewSetter(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!avatar) return toast.error("Avatar is required");
        setLoading(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("avatar", avatar);
        if (coverImage) fd.append("coverImage", coverImage);
        try {
            await register(fd);
            toast.success("Account created! Please sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg" />
            <div className="auth-card auth-card-wide fade-in">
                <div className="auth-logo">
                    <div className="logo-icon">▶</div>
                    <span className="logo-text">VidFlow</span>
                </div>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Join VidFlow and start sharing</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-two-col">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrap">
                                <FiUser className="input-icon" />
                                <input name="fullName" type="text" className="form-input with-icon" placeholder="John Doe"
                                    value={form.fullName} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon" style={{ fontWeight: 700, color: "var(--accent2)" }}>@</span>
                                <input name="userName" type="text" className="form-input with-icon" placeholder="johndoe"
                                    value={form.userName} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-icon-wrap">
                            <FiMail className="input-icon" />
                            <input name="email" type="email" className="form-input with-icon" placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrap">
                            <FiLock className="input-icon" />
                            <input name="password" type="password" className="form-input with-icon" placeholder="••••••••"
                                value={form.password} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="auth-two-col">
                        <div className="form-group">
                            <label className="form-label">Avatar <span style={{ color: "var(--red)" }}>*</span></label>
                            <div className="file-upload-box" onClick={() => document.getElementById("avatar-input").click()}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" className="file-preview-img" />
                                    : <><FiImage /><span>Choose avatar</span></>}
                            </div>
                            <input id="avatar-input" type="file" accept="image/*" style={{ display: "none" }}
                                onChange={(e) => handleFile(e, setAvatar, setAvatarPreview)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cover Image <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                            <div className="file-upload-box" onClick={() => document.getElementById("cover-input").click()}>
                                {coverImage
                                    ? <span style={{ color: "var(--green)", fontSize: 12 }}>✓ {coverImage.name}</span>
                                    : <><FiImage /><span>Choose cover</span></>}
                            </div>
                            <input id="cover-input" type="file" accept="image/*" style={{ display: "none" }}
                                onChange={(e) => handleFile(e, setCoverImage, null)} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        <FiUserPlus /> {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
