import bcrypt from 'bcrypt';
import { db } from './database.js';

export function addCategory({ name, type }) {
  const info = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
  return { id: info.lastInsertRowid, name, type };
}

export function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY id').all();
}

export function getCategoryById(id) {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
}

export function listCategoriesByType(type) {
  return db.prepare('SELECT * FROM categories WHERE type = ? ORDER BY id').all(type);
}

export function getCategoriesByType(type) {
  return listCategoriesByType(type);
}

export function getCategories() {
  return listCategories();
}