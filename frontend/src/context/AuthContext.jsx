import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("ayalkootam_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ayalkootam_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("ayalkootam_token", data.token);
    localStorage.setItem("ayalkootam_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("ayalkootam_token");
    localStorage.removeItem("ayalkootam_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout, isAuthed: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
