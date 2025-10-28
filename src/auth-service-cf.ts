// Simplified Auth Service for Cloudflare Workers
// Uses Web Crypto API instead of bcrypt and custom JWT implementation

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

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  teamId: number | null;
  exp?: number;
  iat?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthServiceCF {
  private db: D1Database;
  private jwtSecret: string;
  
  constructor(db: D1Database, env: any) {
    this.db = db;
    this.jwtSecret = env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  }

  // Simple password hashing using Web Crypto API (SHA-256)
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.jwtSecret); // Add salt
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hash);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Convert ArrayBuffer to hex string
  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Simple JWT generation (without external library)
  generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.team_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    const accessToken = this.createSimpleJWT(payload);
    
    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    const refreshToken = this.createSimpleJWT(refreshPayload);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  // Create a simple JWT (base64 encoded JSON with signature)
  private createSimpleJWT(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Create signature for JWT
  private createSignature(data: string): string {
    // Simple signature using the secret (not cryptographically secure but works for demo)
    const hash = btoa(data + this.jwtSecret);
    return hash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  // Verify JWT token
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Verify signature
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
      if (signature !== expectedSignature) return null;

      // Decode payload
      const payload = JSON.parse(atob(encodedPayload));
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload as JWTPayload;
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
        const teamSlug = email.split('@')[0] + '-' + Date.now();
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
      // Verify refresh token format
      const payload = this.verifyAccessToken(refreshToken);
      if (!payload || (payload as any).type !== 'refresh') {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Check if session exists and is valid
      const session = await this.db
        .prepare(
          'SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > datetime("now")'
        )
        .bind(refreshToken)
        .first<any>();

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
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.db
        .prepare(
          `INSERT INTO invitations (team_id, email, role, token, expires_at, invited_by) 
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(teamId, email, role, token, expiresAt.toISOString(), invitedBy)
        .run();

      return { success: true, token };
    } catch (error: any) {
      console.error('Invite error:', error);
      return { success: false, error: error.message };
    }
  }
}