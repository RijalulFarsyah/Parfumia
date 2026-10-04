import { db } from './database.js';

export function getReviewsByProduct(productId) {
  return db
    .prepare(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.username
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.id`
    )
    .all(productId);
}

export function addReview({ productId, userId, rating, comment }) {
  const info = db
    .prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(productId, userId, rating, comment ?? null);
  return { id: info.lastInsertRowid, productId, userId, rating, comment };
}

export function getReviewsForStore(storeId) {
  return db
    .prepare(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.username
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       WHERE p.store_id = ?
       ORDER BY r.id`
    )
    .all(storeId);
}
