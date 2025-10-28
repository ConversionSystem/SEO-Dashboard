-- Seed data for authentication system
-- Password for all demo accounts: demo123

-- Update admin user with SHA-256 hash (password: admin123)
UPDATE users 
SET password_hash = 'a884852b64b184fe3875f7e6c939e0de956750f4dbeed1a667a77624f3c3799f' 
WHERE email = 'admin@conversionsystem.com';

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

-- Insert another team for testing
INSERT OR IGNORE INTO teams (name, slug, description) 
VALUES ('Marketing Team', 'marketing-team', 'Marketing and SEO specialists');

-- Insert user in marketing team (password: demo123)
INSERT OR IGNORE INTO users (email, password_hash, name, role, team_id, is_active, email_verified) 
VALUES (
  'marketer@conversionsystem.com',
  'fc1008b96390aba5840457af6abe22d0c0061fa6c64c5e0eb2cc12d568ef0b47',
  'Marketing Lead',
  'admin',
  2,
  1,
  1
);