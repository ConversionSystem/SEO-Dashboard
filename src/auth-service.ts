import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  team_id: number | null;
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  refresh_token: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  teamId: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private db: D1Database;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry = '15m'; // 15 minutes
  private refreshTokenExpiry = '7d'; // 7 days

  constructor(db: D1Database, env: any) {
    this.db = db;
    // Use environment variables or generate secrets
    this.jwtSecret = env.JWT_SECRET || 'your-jwt-secret-key-change-this';
    this.jwtRefreshSecret = env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this';
  }

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT tokens
  generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.team_id
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  // Verify access token
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as { userId: number };
    } catch (error) {
      return null;
    }
  }

  // Register new user
  async register(
    email: string,
    password: string,
    name: string,
    teamId?: number
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.db
        .prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first();

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // If no team specified, create a new team for the user
      let actualTeamId = teamId;
      if (!actualTeamId) {
        const teamSlug = email.split('@')[0] + '-' + nanoid(6);
        const teamResult = await this.db
          .prepare('INSERT INTO teams (name, slug, description) VALUES (?, ?, ?)')
          .bind(`${name}'s Team`, teamSlug, 'Personal team')
          .run();
        
        actualTeamId = teamResult.meta.last_row_id as number;
      }

      // Insert new user
      const result = await this.db
        .prepare(
          `INSERT INTO users (email, password_hash, name, role, team_id, is_active, email_verified) 
           VALUES (?, ?, ?, ?, ?, 1, 0)`
        )
        .bind(
          email,
          passwordHash,
          name,
          teamId ? 'member' : 'admin', // First user in new team is admin
          actualTeamId
        )
        .run();

      const userId = result.meta.last_row_id as number;

      // Get the created user
      const user = await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .first<User>();

      // Log the registration
      await this.logAudit(userId, actualTeamId, 'user_registered', 'user', userId);

      return { success: true, user: user! };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; tokens?: AuthTokens; user?: User; error?: string }> {
    try {
      // Get user by email
      const user = await this.db
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first<User & { password_hash: string }>();

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if user is active
      if (!user.is_active) {
        return { success: false, error: 'Account is disabled' };
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Save refresh token in sessions
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.db
        .prepare(
          `INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
          user.id,
          tokens.refreshToken,
          expiresAt.toISOString(),
          ipAddress || null,
          userAgent || null
        )
        .run();

      // Update last login
      await this.db
        .prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(user.id)
        .run();

      // Log the login
      await this.logAudit(user.id, user.team_id, 'user_login', 'user', user.id, { ipAddress });

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        tokens,
        user: userWithoutPassword as User
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Refresh access token
  async refreshToken(
    refreshToken: string
  ): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);
      if (!payload) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Check if session exists and is valid
      const session = await this.db
        .prepare(
          'SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > datetime("now")'
        )
        .bind(refreshToken)
        .first<Session>();

      if (!session) {
        return { success: false, error: 'Session expired or invalid' };
      }

      // Get user
      const user = await this.db
        .prepare('SELECT * FROM users WHERE id = ? AND is_active = 1')
        .bind(payload.userId)
        .first<User>();

      if (!user) {
        return { success: false, error: 'User not found or inactive' };
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update session with new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.db
        .prepare(
          'UPDATE sessions SET refresh_token = ?, expires_at = ? WHERE id = ?'
        )
        .bind(tokens.refreshToken, expiresAt.toISOString(), session.id)
        .run();

      return { success: true, tokens };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    try {
      await this.db
        .prepare('DELETE FROM sessions WHERE refresh_token = ?')
        .bind(refreshToken)
        .run();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .first<User>();

      return user || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get team by ID
  async getTeamById(teamId: number): Promise<Team | null> {
    try {
      const team = await this.db
        .prepare('SELECT * FROM teams WHERE id = ?')
        .bind(teamId)
        .first<Team>();

      return team || null;
    } catch (error) {
      console.error('Get team error:', error);
      return null;
    }
  }

  // Get team members
  async getTeamMembers(teamId: number): Promise<User[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM users WHERE team_id = ? ORDER BY created_at DESC')
        .bind(teamId)
        .all<User>();

      return result.results || [];
    } catch (error) {
      console.error('Get team members error:', error);
      return [];
    }
  }

  // Update user role
  async updateUserRole(
    userId: number,
    newRole: 'admin' | 'manager' | 'member',
    updatedBy: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db
        .prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(newRole, userId)
        .run();

      // Get user for audit
      const user = await this.getUserById(userId);
      if (user) {
        await this.logAudit(
          updatedBy,
          user.team_id,
          'user_role_updated',
          'user',
          userId,
          { newRole, oldRole: user.role }
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update role error:', error);
      return { success: false, error: error.message };
    }
  }

  // Invite user to team
  async inviteToTeam(
    email: string,
    teamId: number,
    role: 'admin' | 'manager' | 'member',
    invitedBy: number
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const token = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.db
        .prepare(
          `INSERT INTO invitations (team_id, email, role, token, expires_at, invited_by) 
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(teamId, email, role, token, expiresAt.toISOString(), invitedBy)
        .run();

      await this.logAudit(invitedBy, teamId, 'invitation_sent', 'invitation', null, { email, role });

      return { success: true, token };
    } catch (error: any) {
      console.error('Invite error:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept invitation
  async acceptInvitation(
    token: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; user?: User; tokens?: AuthTokens; error?: string }> {
    try {
      // Get invitation
      const invitation = await this.db
        .prepare(
          'SELECT * FROM invitations WHERE token = ? AND expires_at > datetime("now") AND accepted_at IS NULL'
        )
        .bind(token)
        .first<any>();

      if (!invitation) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      // Register user with team
      const result = await this.register(invitation.email, password, name, invitation.team_id);
      
      if (!result.success) {
        return result;
      }

      // Update user role if different from default
      if (invitation.role !== 'member' && result.user) {
        await this.updateUserRole(result.user.id, invitation.role, result.user.id);
      }

      // Mark invitation as accepted
      await this.db
        .prepare('UPDATE invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(invitation.id)
        .run();

      // Generate tokens for immediate login
      const tokens = this.generateTokens(result.user!);

      return { success: true, user: result.user, tokens };
    } catch (error: any) {
      console.error('Accept invitation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Log audit event
  private async logAudit(
    userId: number | null,
    teamId: number | null,
    action: string,
    entityType: string | null,
    entityId: number | null,
    metadata?: any
  ): Promise<void> {
    try {
      await this.db
        .prepare(
          `INSERT INTO audit_logs (user_id, team_id, action, entity_type, entity_id, metadata) 
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          userId,
          teamId,
          action,
          entityType,
          entityId,
          metadata ? JSON.stringify(metadata) : null
        )
        .run();
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    try {
      await this.db
        .prepare('DELETE FROM sessions WHERE expires_at < datetime("now")')
        .run();
    } catch (error) {
      console.error('Clean sessions error:', error);
    }
  }
}