import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fm_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 'buyer_demo_id',
      name: 'Apex Apparel Studio',
      email: 'buyer@fabricmart.com',
      role: 'buyer'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('fm_token') || 'demo_jwt_token_2026');
  const [profile, setProfile] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fm_theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fm_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fm_user', JSON.stringify(data.user));
      localStorage.setItem('fm_token', data.token);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fm_user', JSON.stringify(data.user));
      localStorage.setItem('fm_token', data.token);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setProfile(null);
    localStorage.removeItem('fm_user');
    localStorage.removeItem('fm_token');
  };

  // Switch role directly for demo convenience
  const switchRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    if (newRole === 'supplier' && user.name === 'Apex Apparel Studio') {
      updatedUser.name = 'Vanguard Textile Mills';
    } else if (newRole === 'buyer' && user.name === 'Vanguard Textile Mills') {
      updatedUser.name = 'Apex Apparel Studio';
    }
    setUser(updatedUser);
    localStorage.setItem('fm_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      darkMode,
      toggleDarkMode,
      login,
      register,
      logout,
      switchRole,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
