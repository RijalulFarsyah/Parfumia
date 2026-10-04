import bcrypt from 'bcrypt';
import { db } from './database.js';

export function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function findUserById(id) {
  const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(id);
  return user;
}

export function createUser({ username, password, role }) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .run(username, passwordHash, role || 'buyer');
  return {
    id: info.lastInsertRowid,
    username,
    role: role || 'buyer',
  };
}

export function updateUserRole(userId, role) {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  return findUserById(userId);
}
