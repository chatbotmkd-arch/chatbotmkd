import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: number; // 0=free, 1=starter, 2=pro
}

interface Team {
  id: string;
  name: string;
  plan: number;
}

interface AuthContextType {
  user: User | null;
  team: Team | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const PLAN_NAMES: Record<number, string> = {
  0: "Бесплатен",
  1: "Стартер",
  2: "Про",
};

export const PLAN_LIMITS: Record<number, { maxMessages: number; maxChatbots: number; maxSources: number; isLifetime: boolean }> = {
  0: { maxMessages: 20, maxChatbots: 1, maxSources: 2, isLifetime: true },
  1: { maxMessages: 2000, maxChatbots: 3, maxSources: 10, isLifetime: false },
  2: { maxMessages: 10000, maxChatbots: 10, maxSources: 50, isLifetime: false },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const data = await api.get<{ user: User; team: Team }>("/auth/me");
    setUser(data.user);
    setTeam(data.team);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchMe()
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, password });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);

    // Fetch team info too
    const meData = await api.get<{ user: User; team: Team }>("/auth/me");
    setTeam(meData.team);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.post<{
      user: User;
      team: Team;
      accessToken: string;
      refreshToken: string;
    }>("/auth/register", { email, password, name });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    setTeam(data.team);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setTeam(null);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, team, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
