import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import "./AuthPage.css";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg" />
            <div className="auth-card fade-in">
                <div className="auth-logo">
                    <div className="logo-icon">▶</div>
                    <span className="logo-text">VidFlow</span>
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to continue to VidFlow</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-icon-wrap">
                            <FiMail className="input-icon" />
                            <input
                                name="email" type="email" className="form-input with-icon"
                                placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrap">
                            <FiLock className="input-icon" />
                            <input
                                name="password" type="password" className="form-input with-icon"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange} required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        <FiLogIn /> {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
}
