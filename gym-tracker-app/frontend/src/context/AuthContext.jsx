import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const STORAGE_TOKEN_KEY = "gym_tracker_token";
const STORAGE_USER_KEY = "gym_tracker_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  const authenticate = async (mode, payload) => {
    const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
    const { data } = await api.post(endpoint, payload);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
