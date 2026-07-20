import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserChannelProfile } from "../api/auth.api";
import { toggleSubscription } from "../api/subscription.api";
import VideoCard from "../components/VideoCard";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FiBell, FiUsers } from "react-icons/fi";
import "./ChannelPage.css";

export default function ChannelPage() {
    const { userName } = useParams();
    const { user } = useAuth();
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getUserChannelProfile(userName);
                const data = res.data.data;
                setChannel(data);
                setSubscribed(data.isSubscribed || false);
            } catch { toast.error("Channel not found"); }
            finally { setLoading(false); }
        };
        load();
    }, [userName]);

    const handleSubscribe = async () => {
        try {
            await toggleSubscription(channel._id);
            setSubscribed(!subscribed);
            toast.success(subscribed ? "Unsubscribed" : "Subscribed!");
        } catch { toast.error("Failed"); }
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;
    if (!channel) return <div className="empty-state"><h3>Channel not found</h3></div>;

    return (
        <div className="channel-page fade-in">
            <div className="channel-cover">
                {channel.coverImage
                    ? <img src={channel.coverImage} alt="cover" className="channel-cover-img" />
                    : <div className="channel-cover-placeholder" />}
            </div>
            <div className="channel-header">
                <div className="channel-avatar-wrap">
                    {channel.avatar
                        ? <img src={channel.avatar} alt={channel.fullName} className="avatar channel-avatar" />
                        : <div className="avatar channel-avatar avatar-placeholder">{channel.fullName?.[0]}</div>}
                </div>
                <div className="channel-info">
                    <h1 className="channel-name">{channel.fullName}</h1>
                    <p className="channel-username">@{channel.userName}</p>
                    <div className="channel-stats">
                        <FiUsers size={14} />
                        <span>{channel.subscriberCount || 0} subscribers</span>
                        <span>·</span>
                        <span>{channel.subscribedToCount || 0} subscriptions</span>
                    </div>

                </div>
                {user?._id !== channel._id && (
                    <button className={`btn ${subscribed ? "btn-secondary" : "btn-primary"}`} onClick={handleSubscribe}>
                        <FiBell /> {subscribed ? "Subscribed" : "Subscribe"}
                    </button>
                )}
            </div>
            <div className="divider" />
            <h2 className="section-title">Videos</h2>
            {channel.videos?.length > 0 ? (
                <div className="video-grid">
                    {channel.videos.map(v => <VideoCard key={v._id} video={{ ...v, owner: channel }} />)}
                </div>
            ) : (
                <div className="empty-state"><h3>No videos yet</h3></div>
            )}
        </div>
    );
}
