import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'student' | 'instructor';
  name: string;
}

interface StoredUser {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: 'student' | 'instructor';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'instructor') => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'student' | 'instructor') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Helper function to get stored users
  const getStoredUsers = (): StoredUser[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  // Helper function to save users
  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const login = async (email: string, password: string, role: 'student' | 'instructor'): Promise<boolean> => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
      const loggedInUser: User = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'instructor'): Promise<boolean> => {
    const users = getStoredUsers();
    
    // Check if user already exists with same email and role
    const existingUser = users.find(u => u.email === email && u.role === role);
    if (existingUser) {
      return false; // User already exists
    }
    
    const newUser: StoredUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      role,
      name,
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto-login after registration
    const loggedInUser: User = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};