import { db } from './database.js';

export function getStoreByUserId(userId) {
  return db.prepare('SELECT * FROM stores WHERE user_id = ?').get(userId);
}

export function getStoreById(id) {
  return db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
}

export function updateStore(userId, { name, logo, description, address }) {
  db.prepare(
    'UPDATE stores SET name = COALESCE(?, name), logo = COALESCE(?, logo), description = COALESCE(?, description), address = COALESCE(?, address) WHERE user_id = ?'
  ).run(name, logo, description, address, userId);
  return getStoreByUserId(userId);
}