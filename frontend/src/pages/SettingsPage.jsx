import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateAccountDetail, updateAvatar, updateCoverImage } from "../api/auth.api";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiCamera, FiSave } from "react-icons/fi";
import "./SettingsPage.css";

export default function SettingsPage() {
    const { user, fetchCurrentUser } = useAuth();
    const [form, setForm] = useState({ fullName: "", email: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ fullName: user.fullName || "", email: user.email || "" });
    }, [user]);

    const handleAccountSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateAccountDetail(form);
            await fetchCurrentUser();
            toast.success("Account updated!");
        } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
        finally { setLoading(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("avatar", file);
        try {
            await updateAvatar(fd);
            await fetchCurrentUser();
            toast.success("Avatar updated!");
        } catch { toast.error("Failed to update avatar"); }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("coverImage", file);
        try {
            await updateCoverImage(fd);
            await fetchCurrentUser();
            toast.success("Cover image updated!");
        } catch { toast.error("Failed to update cover image"); }
    };

    return (
        <div className="settings-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account and profile</p>
            </div>
            <div className="settings-layout">
                {/* Profile Images */}
                <div className="settings-section card">
                    <h2 className="settings-section-title">Profile Images</h2>
                    <div className="profile-images-row">
                        <div className="profile-img-item">
                            <div className="profile-img-wrap">
                                {user?.avatar
                                    ? <img src={user.avatar} alt="avatar" className="avatar avatar-xl" />
                                    : <div className="avatar avatar-xl avatar-placeholder" style={{ fontSize: 32 }}>{user?.fullName?.[0]}</div>}
                                <label className="img-edit-btn" htmlFor="avatar-change">
                                    <FiCamera />
                                </label>
                                <input id="avatar-change" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                            </div>
                            <p className="profile-img-label">Avatar</p>
                        </div>
                        <div className="profile-img-item" style={{ flex: 1 }}>
                            <div className="cover-img-wrap">
                                {user?.coverImage
                                    ? <img src={user.coverImage} alt="cover" className="cover-preview-img" />
                                    : <div className="cover-placeholder">No cover image</div>}
                                <label className="cover-edit-btn" htmlFor="cover-change">
                                    <FiCamera /> Change Cover
                                </label>
                                <input id="cover-change" type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverChange} />
                            </div>
                            <p className="profile-img-label">Cover Image</p>
                        </div>
                    </div>
                </div>

                {/* Account Details */}
                <div className="settings-section card">
                    <h2 className="settings-section-title">Account Details</h2>
                    <form onSubmit={handleAccountSave}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrap">
                                <FiUser className="input-icon" />
                                <input type="text" className="form-input with-icon" value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-icon-wrap">
                                <FiMail className="input-icon" />
                                <input type="email" className="form-input with-icon" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiSave /> {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
