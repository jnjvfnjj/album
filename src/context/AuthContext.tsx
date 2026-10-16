import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (email: string, displayName: string, password?: string) => Promise<boolean>;
  signOut: () => void;
  enableDemoMode: () => void;
  updateProfile: (displayName: string) => void;
}

const DEMO_USER: User = {
  id: 'user_demo_alex',
  email: 'alex.vance@aperture.live',
  displayName: 'Alex Vance',
  isDemo: true,
  createdAt: '2026-01-15T08:00:00.000Z',
};

const AUTH_STORAGE_KEY = 'aperture_current_user';
const USERS_REGISTRY_KEY = 'aperture_registered_users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(DEMO_USER);
        }
      } else {
        setUser(DEMO_USER);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
        } catch {
          // ignore private browsing quota errors
        }
      }
    } catch {
      setUser(DEMO_USER);
    }
  }, []);

  const signIn = async (email: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem(USERS_REGISTRY_KEY);
      const registry: User[] = usersStr ? JSON.parse(usersStr) : [];
      const existing = registry.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        setUser(existing);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existing));
        return true;
      }

      // If user not registered yet, create automatic account for frictionless UX
      const newUser: User = {
        id: `user_${Date.now().toString(36)}`,
        email,
        displayName: email.split('@')[0],
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      registry.push(newUser);
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const signUp = async (email: string, displayName: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem(USERS_REGISTRY_KEY);
      const registry: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const newUser: User = {
        id: `user_${Date.now().toString(36)}`,
        email,
        displayName: displayName || email.split('@')[0],
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      
      registry.push(newUser);
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const enableDemoMode = () => {
    setUser(DEMO_USER);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
  };

  const updateProfile = (displayName: string) => {
    if (!user) return;
    const updated = { ...user, displayName };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isDemoMode: !!user?.isDemo,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
