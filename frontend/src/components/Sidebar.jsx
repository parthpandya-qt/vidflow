import { NavLink } from "react-router-dom";
import {
    FiHome, FiClock, FiHeart, FiList, FiMessageSquare, FiBarChart2,
} from "react-icons/fi";
import "./Sidebar.css";

const navItems = [
    { to: "/", icon: <FiHome />, label: "Home", exact: true },
    { to: "/history", icon: <FiClock />, label: "History" },
    { to: "/liked", icon: <FiHeart />, label: "Liked Videos" },
    { to: "/playlists", icon: <FiList />, label: "Playlists" },
    { to: "/tweets", icon: <FiMessageSquare />, label: "Community" },
    { to: "/dashboard", icon: <FiBarChart2 />, label: "Dashboard" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navItems.map(({ to, icon, label, exact }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={exact}
                        className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
                    >
                        <span className="sidebar-icon">{icon}</span>
                        <span className="sidebar-label">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
