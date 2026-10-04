import { db } from './database.js';

export function addToWishlist(userId, productId) {
  const info = db
    .prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)')
    .run(userId, productId);
  return info.changes > 0;
}

export function removeFromWishlist(userId, productId) {
  const info = db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(userId, productId);
  return info.changes > 0;
}

export function isInWishlist(userId, productId) {
  return !!db.prepare('SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ?').get(userId, productId);
}

export function getWishlistItems(userId) {
  return db
    .prepare(
      `SELECT
        p.id, p.store_id, p.name, p.brand, p.gender, p.concentration,
        p.price, p.stock, p.image, p.description, p.status
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`
    )
    .all(userId);
}

export function getWishlistCount(userId) {
  return Number(db.prepare('SELECT COUNT(*) AS c FROM wishlists WHERE user_id = ?').get(userId).c);
}
