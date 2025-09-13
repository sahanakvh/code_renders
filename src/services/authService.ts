import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types';
import DatabaseConnection from './dbConnection';

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

class AuthService {
  private db: DatabaseConnection;
  private jwtSecret: string;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.jwtSecret = process.env.JWT_SECRET || 'ayur-flow-sutra-secret-key';
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      await this.db.connect();

      // Check if user already exists
      const existingUser = await this.db.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length > 0) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Insert new user
      const result = await this.db.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, full_name, phone, role`,
        [userData.email, passwordHash, userData.fullName, userData.phone, userData.role]
      );

      const newUser = result.rows[0];
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone
      };

      // Generate token
      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token,
        message: 'Registration successful'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      await this.db.connect();

      // Get user by email
      const result = await this.db.query(
        'SELECT id, email, password_hash, full_name, phone, role, is_active FROM users WHERE email = $1',
        [credentials.email]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      await this.db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone
      };

      // Generate token
      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Get user by token
  async getUserByToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      await this.db.connect();

      const result = await this.db.query(
        'SELECT id, email, full_name, phone, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.id]
      );

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone
      };

    } catch (error) {
      console.error('Get user by token error:', error);
      return null;
    }
  }

  // Logout (client-side token removal)
  logout(): void {
    // In a real application, you might want to blacklist the token
    // For now, this is handled client-side by removing the token from storage
  }
}

export default new AuthService();
