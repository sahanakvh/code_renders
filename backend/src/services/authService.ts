import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database';
import { User, RegisterData, LoginCredentials, AuthUser, AuthResponse, JWTPayload } from '../types/auth';

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Insert new user into database
      const query = `
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, phone, role, created_at
      `;
      
      const values = [data.email, passwordHash, data.fullName, data.phone, data.role];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Failed to create user'
        };
      }

      const user = result.rows[0];
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone
      };

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

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
        message: 'Internal server error during registration'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.findUserByEmail(credentials.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone
      };

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

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
        message: 'Internal server error during login'
      };
    }
  }

  async getUserByToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      const user = await this.findUserById(decoded.userId);
      if (!user) return null;

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

  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  private async findUserById(id: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Find user by ID error:', error);
      return null;
    }
  }

  private generateToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn } as jwt.SignOptions);
  }

  private verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  validateToken(token: string): boolean {
    return this.verifyToken(token) !== null;
  }
}

export default new AuthService();
