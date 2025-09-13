import { Request, Response } from 'express';
import authService from '../services/authService';
import { LoginCredentials, RegisterData } from '../types/auth';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData: RegisterData = req.body;

      // Validate required fields
      if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.role) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: email, password, fullName, and role are required'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Validate password strength
      if (registerData.password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Validate role
      const validRoles = ['patient', 'therapist', 'admin'];
      if (!validRoles.includes(registerData.role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: patient, therapist, admin'
        });
        return;
      }

      const result = await authService.register(registerData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await authService.login(credentials);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const user = await authService.getUserByToken(token);

      if (user) {
        res.status(200).json({
          success: true,
          user
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    } catch (error) {
      console.error('Me controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        });
        return;
      }

      const token = authHeader.substring(7);
      const isValid = authService.validateToken(token);

      res.status(200).json({
        success: true,
        valid: isValid
      });
    } catch (error) {
      console.error('Validate token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new AuthController();
