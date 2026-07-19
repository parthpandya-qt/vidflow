import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/ChatWidget";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import UploadVideoPage from "./pages/UploadVideoPage";
import ChannelPage from "./pages/ChannelPage";
import WatchHistoryPage from "./pages/WatchHistoryPage";
import LikedVideosPage from "./pages/LikedVideosPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistViewPage from "./pages/PlaylistViewPage";
import TweetsPage from "./pages/TweetsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

function AppRoutes() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: "100vh" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      {isLoggedIn && <Navbar />}
      <div className={isLoggedIn ? "app-layout" : ""}>
        {isLoggedIn && <Sidebar />}
        <main className={isLoggedIn ? "main-content fade-in" : "main-content no-sidebar fade-in"}>
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/video/:videoId" element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadVideoPage /></ProtectedRoute>} />
            <Route path="/channel/:userName" element={<ProtectedRoute><ChannelPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><WatchHistoryPage /></ProtectedRoute>} />
            <Route path="/liked" element={<ProtectedRoute><LikedVideosPage /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
            <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistViewPage /></ProtectedRoute>} />
            <Route path="/tweets" element={<ProtectedRoute><TweetsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#16161f",
            color: "#f0f0ff",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />
      {isLoggedIn && <ChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
