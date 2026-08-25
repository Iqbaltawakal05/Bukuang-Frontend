import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  updatePassword: (current_password: string, new_password: string, new_password_confirmation: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('bukuang_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bukuang_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/profile');
          setUser(response.data.data);
          localStorage.setItem('bukuang_user', JSON.stringify(response.data.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('bukuang_token', newToken);
    localStorage.setItem('bukuang_user', JSON.stringify(newUser));
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await api.post('/auth/register', { name, email, password, password_confirmation });
    const { token: newToken, user: newUser } = response.data.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('bukuang_token', newToken);
    localStorage.setItem('bukuang_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore logout API errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('bukuang_token');
      localStorage.removeItem('bukuang_user');
    }
  };

  const updateProfile = async (name: string) => {
    const response = await api.put('/profile', { name });
    setUser(response.data.data);
    localStorage.setItem('bukuang_user', JSON.stringify(response.data.data));
  };

  const updatePassword = async (current_password: string, new_password: string, new_password_confirmation: string) => {
    await api.put('/profile/password', {
      current_password,
      password: new_password,
      password_confirmation: new_password_confirmation,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
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
