import { Context, Next } from 'hono';
import { AuthServiceCF, JWTPayload } from './auth-service-cf';

// Extend context with auth data
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload | null;
    isAuthenticated: boolean;
  }
}

export interface AuthMiddlewareOptions {
  required?: boolean; // Whether authentication is required
  roles?: string[]; // Required roles (if any)
}

// Create auth middleware
export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  return async (c: Context, next: Next) => {
    const { required = true, roles = [] } = options;

    try {
      // Get token from Authorization header
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (required) {
          return c.json({ error: 'No authorization token provided' }, 401);
        }
        c.set('user', null);
        c.set('isAuthenticated', false);
        return await next();
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Get auth service
      const authService = new AuthServiceCF(c.env.DB, c.env);
      
      // Verify token
      const payload = authService.verifyAccessToken(token);
      
      if (!payload) {
        if (required) {
          return c.json({ error: 'Invalid or expired token' }, 401);
        }
        c.set('user', null);
        c.set('isAuthenticated', false);
        return await next();
      }

      // Check role requirements
      if (roles.length > 0 && !roles.includes(payload.role)) {
        return c.json({ error: 'Insufficient permissions' }, 403);
      }

      // Set user in context
      c.set('user', payload);
      c.set('isAuthenticated', true);

      return await next();
    } catch (error: any) {
      console.error('Auth middleware error:', error);
      if (required) {
        return c.json({ error: 'Authentication failed' }, 401);
      }
      c.set('user', null);
      c.set('isAuthenticated', false);
      return await next();
    }
  };
}

// Shorthand middleware for common cases
export const requireAuth = authMiddleware({ required: true });
export const optionalAuth = authMiddleware({ required: false });
export const requireAdmin = authMiddleware({ required: true, roles: ['admin'] });
export const requireManager = authMiddleware({ required: true, roles: ['admin', 'manager'] });