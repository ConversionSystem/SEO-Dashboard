-- Seed data for production authentication
-- Password for all demo accounts: demo123

-- Insert demo user (password: demo123) 
INSERT OR IGNORE INTO users (email, password_hash, name, role, team_id, is_active, email_verified) 
VALUES (
  'demo@conversionsystem.com',
  'fc1008b96390aba5840457af6abe22d0c0061fa6c64c5e0eb2cc12d568ef0b47',
  'Demo User',
  'member',
  1,
  1,
  1
);

-- Insert manager user (password: demo123)
INSERT OR IGNORE INTO users (email, password_hash, name, role, team_id, is_active, email_verified) 
VALUES (
  'manager@conversionsystem.com',
  'fc1008b96390aba5840457af6abe22d0c0061fa6c64c5e0eb2cc12d568ef0b47',
  'Manager User',
  'manager',
  1,
  1,
  1
);