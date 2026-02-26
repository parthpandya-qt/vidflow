import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiUpload, FiLogOut, FiUser, FiSettings, FiBarChart2 } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
            setSearch("");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
            toast.success("Logged out successfully");
        } catch {
            toast.error("Logout failed");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">▶</div>
                    <span className="logo-text">VidFlow</span>
                </Link>
            </div>

            <div className="navbar-center">
                <form className="search-form" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </form>
            </div>

            <div className="navbar-right">
                <Link to="/upload" className="btn btn-primary btn-sm">
                    <FiUpload size={14} /> Upload
                </Link>
                <div className="user-menu-wrapper">
                    <button
                        className="user-avatar-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.fullName} className="avatar avatar-sm" />
                        ) : (
                            <div className="avatar avatar-sm avatar-placeholder">
                                {user?.fullName?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </button>
                    {menuOpen && (
                        <div className="user-dropdown" onClick={() => setMenuOpen(false)}>
                            <div className="dropdown-header">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="avatar avatar-md" />
                                ) : (
                                    <div className="avatar avatar-md avatar-placeholder">
                                        {user?.fullName?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="dropdown-name">{user?.fullName}</div>
                                    <div className="dropdown-email">{user?.email}</div>
                                </div>
                            </div>
                            <div className="dropdown-divider" />
                            <Link to={`/channel/${user?.userName}`} className="dropdown-item">
                                <FiUser size={15} /> My Channel
                            </Link>
                            <Link to="/dashboard" className="dropdown-item">
                                <FiBarChart2 size={15} /> Dashboard
                            </Link>
                            <Link to="/settings" className="dropdown-item">
                                <FiSettings size={15} /> Settings
                            </Link>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                                <FiLogOut size={15} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
