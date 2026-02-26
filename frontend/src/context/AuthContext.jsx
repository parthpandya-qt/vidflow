import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            setUser(res.data.data);
            setIsLoggedIn(true);
        } catch {
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        setUser(res.data.data.user);
        setIsLoggedIn(true);
        return res;
    };

    const register = async (formData) => {
        const res = await registerUser(formData);
        return res;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, register, fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
