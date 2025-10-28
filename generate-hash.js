// Generate SHA-256 hashes for passwords
import crypto from 'crypto';

function hashPassword(password) {
  const secret = 'your-secret-key-change-this-in-production';
  const hash = crypto.createHash('sha256');
  hash.update(password + secret);
  return hash.digest('hex');
}

// Generate hashes for demo passwords
console.log('admin123:', hashPassword('admin123'));
console.log('demo123:', hashPassword('demo123'));