import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      if (token) {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.data);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authService.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error context:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await authService.register(name, email, password);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error context:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
