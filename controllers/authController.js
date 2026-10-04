import bcrypt from 'bcrypt';
import { findUserByUsername, findUserById, createUser } from '../models/users.js';

export function register(req, res) {
  const { username, password, role } = req.body ?? {};

  if (!username || typeof username !== 'string' || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = createUser({ username, password, role });

  req.session.userId = user.id;
  req.session.role = user.role;

  return new Promise((resolve) => {
    req.session.save((err) => {
      if (err) return res.status(500).json({ error: 'Failed to save session' });
      resolve(res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } }));
    });
  });
}

export function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  return new Promise((resolve) => {
    req.session.save((err) => {
      if (err) return res.status(500).json({ error: 'Failed to save session' });
      resolve(res.json({ user: { id: user.id, username: user.username, role: user.role } }));
    });
  });
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
}

export function me(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = findUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
}
