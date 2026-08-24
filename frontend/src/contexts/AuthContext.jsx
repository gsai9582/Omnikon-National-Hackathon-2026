import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async (currentToken) => {
    if (currentToken) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fetch full user profile from /me endpoint
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(meRes.data);
    return res;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fetch full user profile from /me endpoint
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(meRes.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
