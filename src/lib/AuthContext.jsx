import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { setToken, clearToken, getToken } from './api.js';

const USER_KEY = 'repairhub_user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((token, userObj) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    setUser(userObj);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const isLoggedIn = !!getToken() && !!user;

  // Memoized so consumers (ProtectedRoute, every page via useAuth()) don't re-render
  // on every AuthProvider render — only when something in here actually changes.
  const value = useMemo(
    () => ({ user, login, logout, updateUser, isLoggedIn }),
    [user, login, logout, updateUser, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Wrap any route element: <ProtectedRoute><Home /></ProtectedRoute>
// Redirects to /login (preserving the originally requested path) if not signed in.
//
// This build is the customer flow only, so a logged-in non-customer account (admin,
// technician) can't just be redirected to /login — Login.jsx itself redirects anyone
// already logged in straight back to /home, which would bounce forever between the
// two routes. So here we actively log the mismatched session out first (via effect,
// since that's a side effect and unsafe to run during render), then redirect once
// isLoggedIn has actually gone false.
export function ProtectedRoute({ children }) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const wrongRole = isLoggedIn && user?.role !== 'customer';

  useEffect(() => {
    if (wrongRole) logout();
  }, [wrongRole, logout]);

  if (wrongRole) return null; // logging out this tick; next render takes the !isLoggedIn branch below

  if (!isLoggedIn) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}
