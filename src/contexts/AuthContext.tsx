import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../services/apiAuthService';
import apiAuthService from '../services/apiAuthService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ayur_flow_auth_token';
const USER_KEY = 'ayur_flow_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const initializeAuth = async () => {
      const savedToken = apiAuthService.getStoredToken();
      
      if (savedToken) {
        try {
          // Validate token with API
          const isValid = await apiAuthService.validateToken(savedToken);
          
          if (isValid) {
            // Get user data from API
            const userData = await apiAuthService.getUserByToken(savedToken);
            
            if (userData) {
              setToken(savedToken);
              setUser(userData);
            } else {
              // Token is valid but user data couldn't be retrieved
              apiAuthService.clearStoredToken();
            }
          } else {
            // Token is invalid, clear it
            apiAuthService.clearStoredToken();
          }
        } catch (error) {
          console.error('Error validating auth token:', error);
          apiAuthService.clearStoredToken();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: AuthUser, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    // Token is already stored by apiAuthService, but we keep these for backward compatibility
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiAuthService.clearStoredToken();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
