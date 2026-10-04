import { db } from './database.js';

export function getCartItems(userId) {
  return db
    .prepare(
      `SELECT
        c.product_id AS product_id,
        p.id, p.store_id, p.name, p.brand, p.price, p.stock, p.image, p.description, p.status,
        c.qty
       FROM carts c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(userId);
}

export function getCartCount(userId) {
  return Number(db.prepare('SELECT COALESCE(SUM(qty), 0) AS c FROM carts WHERE user_id = ?').get(userId).c);
}

export function getCartItem(userId, productId) {
  return db
    .prepare(
      `SELECT
        c.product_id AS product_id,
        p.id, p.store_id, p.name, p.brand, p.price, p.stock, p.image, p.description, p.status,
        c.qty
       FROM carts c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ? AND c.product_id = ?`
    )
    .get(userId, productId);
}

export function addToCart(userId, productId, qty) {
  const info = db
    .prepare('INSERT OR IGNORE INTO carts (user_id, product_id, qty) VALUES (?, ?, ?)')
    .run(userId, productId, qty);
  if (info.changes === 0) {
    const row = db.prepare('SELECT qty FROM carts WHERE user_id = ? AND product_id = ?').get(userId, productId);
    if (row) {
      db.prepare('UPDATE carts SET qty = qty + 1 WHERE user_id = ? AND product_id = ?').run(userId, productId);
      return { added: false, qty: row.qty + 1 };
    }
  }
  return { added: true, qty: qty };
}

export function updateCartQty(userId, productId, qty) {
  if (qty <= 0) {
    return removeFromCart(userId, productId);
  }
  const info = db.prepare('UPDATE carts SET qty = ? WHERE user_id = ? AND product_id = ?').run(qty, userId, productId);
  return info.changes > 0;
}

export function removeFromCart(userId, productId) {
  const info = db.prepare('DELETE FROM carts WHERE user_id = ? AND product_id = ?').run(userId, productId);
  return info.changes > 0;
}

export function clearCart(userId) {
  const info = db.prepare('DELETE FROM carts WHERE user_id = ?').run(userId);
  return info.changes > 0;
}

export function getCartTotal(userId) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(p.price * c.qty), 0) AS total
       FROM carts c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .get(userId);
  return Number(row.total);
}
