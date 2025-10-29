import { Context, Next } from 'hono';

// Simple auth middleware for demo
export function requireAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.substring(7);
    
    // Simple token verification (base64 decode)
    try {
      const payload = JSON.parse(atob(token));
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now()) {
        return c.json({ error: 'Token expired' }, 401);
      }
      
      c.set('user', payload);
      c.set('isAuthenticated', true);
      return next();
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

export function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      c.set('user', null);
      c.set('isAuthenticated', false);
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        c.set('user', null);
        c.set('isAuthenticated', false);
      } else {
        c.set('user', payload);
        c.set('isAuthenticated', true);
      }
    } catch {
      c.set('user', null);
      c.set('isAuthenticated', false);
    }
    
    return next();
  } catch {
    c.set('user', null);
    c.set('isAuthenticated', false);
    return next();
  }
}

export function requireAdmin(c: Context, next: Next) {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  return next();
}