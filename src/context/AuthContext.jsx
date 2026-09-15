import { createContext, useContext, useState } from "react";

// Sesi login tunggal, menetap di localStorage. Tanpa logout (sesuai permintaan).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("qa_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("qa_user"));

  function save(t, u) {
    localStorage.setItem("qa_token", t);
    localStorage.setItem("qa_user", u);
    setToken(t);
    setUsername(u);
  }

  function logout() {
    localStorage.removeItem("qa_token");
    localStorage.removeItem("qa_user");
    setToken(null);
    setUsername(null);
  }

  return <AuthContext.Provider value={{ token, username, save, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
