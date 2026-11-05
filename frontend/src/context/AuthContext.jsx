import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('siha_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('siha_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (token) {
      // Verify profile from server
      api.get('/auth/profile/')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('siha_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login/', { email: email?.trim(), username: email?.trim(), password });
      const { token: authToken, user: userData } = res.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('siha_token', authToken);
      localStorage.setItem('siha_user', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register/', formData);
      const { token: authToken, user: userData } = res.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('siha_token', authToken);
      localStorage.setItem('siha_user', JSON.stringify(userData));
      toast.success('Your account has been created! Welcome to SiHA Craft Studio.');
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Registration failed. Please check your details.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const googleLogin = async (credentialOrPayload) => {
    try {
      const res = await api.post('/auth/google/', credentialOrPayload);
      const { token: authToken, user: userData, is_new_user } = res.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('siha_token', authToken);
      localStorage.setItem('siha_user', JSON.stringify(userData));
      toast.success(is_new_user ? 'Welcome to SiHA Craft Studio!' : `Welcome back, ${userData.first_name || 'Artisan Friend'}!`);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Google sign-in could not be completed.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout/');
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('siha_token');
      localStorage.removeItem('siha_user');
      toast.info('You have been logged out.');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile/', data);
      setUser(res.data);
      localStorage.setItem('siha_user', JSON.stringify(res.data));
      toast.success('Profile details updated successfully.');
      return { success: true, user: res.data };
    } catch (err) {
      toast.error('Failed to update profile.');
      return { success: false };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        googleLogin,
        logout,
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
