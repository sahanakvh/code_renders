import { LoginCredentials, RegisterData, AuthUser, AuthResponse } from './mockAuthService';

// Re-export types for easier imports
export type { LoginCredentials, RegisterData, AuthUser, AuthResponse };

const API_BASE_URL = 'http://localhost:3001/api';

class ApiAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success && result.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Register API error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  async getUserByToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.success ? data.user : null;
    } catch (error) {
      console.error('Get user by token API error:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success && data.valid;
    } catch (error) {
      console.error('Validate token API error:', error);
      return false;
    }
  }

  // Helper method to get token from localStorage
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Helper method to clear stored token
  clearStoredToken(): void {
    localStorage.removeItem('auth_token');
  }
}

export default new ApiAuthService();
