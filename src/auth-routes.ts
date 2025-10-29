import { Hono } from 'hono';
import { AuthServiceCF } from './auth-service-cf';
import { requireAuth, optionalAuth, requireAdmin } from './auth-middleware-simple';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  teamName: z.string().optional()
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member']).default('member')
});

const acceptInviteSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const updateRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(['admin', 'manager', 'member'])
});

// Create auth routes
export const authRoutes = new Hono<{ Bindings: { DB: D1Database } }>();

// Login endpoint - Simplified for demo without database
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  // Demo users - hardcoded for immediate functionality
  const DEMO_USERS = [
    { id: 1, email: 'admin@conversionsystem.com', password: 'admin123', name: 'Admin User', role: 'admin', team_id: 1 },
    { id: 2, email: 'demo@conversionsystem.com', password: 'demo123', name: 'Demo User', role: 'user', team_id: 1 },
    { id: 3, email: 'manager@conversionsystem.com', password: 'demo123', name: 'Manager User', role: 'manager', team_id: 1 }
  ];
  
  // Find user
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Generate simple tokens
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    teamId: user.team_id,
    exp: Date.now() + 3600000 // 1 hour
  };
  
  // Simple token generation (base64 encoded for demo)
  const accessToken = btoa(JSON.stringify(payload));
  const refreshToken = 'refresh_' + Math.random().toString(36).substring(2);
  
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      team_id: user.team_id
    },
    tokens: {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: 3600
    }
  });
});

// Register endpoint
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name, teamName } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  // If teamName is provided, create a team first
  let teamId: number | undefined;
  if (teamName) {
    const teamSlug = teamName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const teamResult = await c.env.DB
      .prepare('INSERT INTO teams (name, slug, description) VALUES (?, ?, ?)')
      .bind(teamName, teamSlug, `${teamName} team`)
      .run();
    teamId = teamResult.meta.last_row_id as number;
  }
  
  const result = await authService.register(email, password, name, teamId);
  
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  
  // Auto-login after registration
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For');
  const userAgent = c.req.header('User-Agent');
  const loginResult = await authService.login(email, password, ipAddress, userAgent);
  
  return c.json({
    success: true,
    user: result.user,
    tokens: loginResult.tokens
  });
});

// Refresh token endpoint
authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  const result = await authService.refreshToken(refreshToken);
  
  if (!result.success) {
    return c.json({ error: result.error }, 401);
  }
  
  return c.json({
    success: true,
    tokens: result.tokens
  });
});

// Verify token endpoint (for checking if token is still valid)
authRoutes.get('/verify', requireAuth, async (c) => {
  const user = c.get('user');
  
  return c.json({
    success: true,
    valid: true,
    user: {
      userId: user!.userId,
      email: user!.email,
      role: user!.role,
      teamId: user!.teamId
    }
  });
});

// Logout endpoint
authRoutes.post('/logout', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  const result = await authService.logout(refreshToken);
  
  return c.json({
    success: result.success,
    message: 'Logged out successfully'
  });
});

// Get current user endpoint (requires auth)
authRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  const fullUser = await authService.getUserById(user!.userId);
  
  if (!fullUser) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  // Get team info if user has a team
  let team = null;
  if (fullUser.team_id) {
    team = await authService.getTeamById(fullUser.team_id);
  }
  
  return c.json({
    user: fullUser,
    team
  });
});

// Get team members (requires auth)
authRoutes.get('/team/members', requireAuth, async (c) => {
  const user = c.get('user');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  if (!user!.teamId) {
    return c.json({ error: 'No team associated with user' }, 400);
  }
  
  const members = await authService.getTeamMembers(user!.teamId);
  
  return c.json({
    teamId: user!.teamId,
    members
  });
});

// Invite user to team (requires admin/manager)
authRoutes.post('/team/invite', requireAuth, zValidator('json', inviteSchema), async (c) => {
  const user = c.get('user');
  const { email, role } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  // Check if user has permission to invite
  if (!['admin', 'manager'].includes(user!.role)) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }
  
  if (!user!.teamId) {
    return c.json({ error: 'No team associated with user' }, 400);
  }
  
  const result = await authService.inviteToTeam(email, user!.teamId, role, user!.userId);
  
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  
  // In production, send invitation email here
  // For now, return the invitation token (in production, this would be sent via email)
  return c.json({
    success: true,
    message: `Invitation sent to ${email}`,
    invitationToken: result.token // Remove this in production
  });
});

// Accept invitation
authRoutes.post('/team/accept-invite', zValidator('json', acceptInviteSchema), async (c) => {
  const { token, password, name } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  const result = await authService.acceptInvitation(token, password, name);
  
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json({
    success: true,
    user: result.user,
    tokens: result.tokens
  });
});

// Update user role (requires admin)
authRoutes.put('/team/member/role', requireAdmin, zValidator('json', updateRoleSchema), async (c) => {
  const user = c.get('user');
  const { userId, role } = c.req.valid('json');
  const authService = new AuthServiceCF(c.env.DB, c.env);
  
  const result = await authService.updateUserRole(userId, role, user!.userId);
  
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json({
    success: true,
    message: 'User role updated successfully'
  });
});

// Get audit logs (requires admin)
authRoutes.get('/audit-logs', requireAdmin, async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  const logs = await c.env.DB
    .prepare(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.team_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(user!.teamId, limit, offset)
    .all();
  
  return c.json({
    logs: logs.results,
    total: logs.results.length,
    limit,
    offset
  });
});

// Health check for auth service
authRoutes.get('/health', async (c) => {
  try {
    // Test database connection
    const result = await c.env.DB.prepare('SELECT 1').first();
    
    return c.json({
      status: 'healthy',
      database: result ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return c.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});