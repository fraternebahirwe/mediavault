import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { User } from "../types";
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from "../api/auth.api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    // Guards against React StrictMode's double-invoked mount effect firing
    // two concurrent /auth/refresh calls (the loser would otherwise wipe
    // out the winner's successful login state).
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    refreshRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginRequest({ email, password });
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await registerRequest({ name, email, password });
    setUser(newUser);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
