import { db } from './database.js';

export function listActiveBanners() {
  return db.prepare('SELECT * FROM banners WHERE active = 1 ORDER BY id DESC').all();
}

export function listAllBanners() {
  return db.prepare('SELECT * FROM banners ORDER BY id DESC').all();
}
