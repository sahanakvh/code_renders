import { UserRole } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

// Mock user data for development
const mockUsers = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'patient@demo.com',
    password: 'password123',
    fullName: 'Demo Patient',
    phone: '+91-9876543210',
    role: 'patient' as const
  },
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'therapist@demo.com',
    password: 'password123',
    fullName: 'Demo Therapist',
    phone: '+91-9876543220',
    role: 'therapist' as const
  },
  {
    id: '30000000-0000-0000-0000-000000000001',
    email: 'admin@demo.com',
    password: 'password123',
    fullName: 'Demo Admin',
    phone: '+91-9876543230',
    role: 'admin' as const
  }
];

class MockAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || user.password !== credentials.password) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone
    };

    // Mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 24 * 60 * 60 * 1000 }));

    return {
      success: true,
      user: authUser,
      token,
      message: 'Login successful'
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Create new mock user
    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role
    };

    mockUsers.push(newUser);

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      phone: newUser.phone
    };

    // Mock JWT token
    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, exp: Date.now() + 24 * 60 * 60 * 1000 }));

    return {
      success: true,
      user: authUser,
      token,
      message: 'Registration successful'
    };
  }

  async getUserByToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = JSON.parse(atob(token));
      
      if (decoded.exp < Date.now()) {
        return null; // Token expired
      }

      const user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone
      };
    } catch {
      return null;
    }
  }

  validateToken(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token));
      return decoded.exp > Date.now();
    } catch {
      return false;
    }
  }
}

export default new MockAuthService();
