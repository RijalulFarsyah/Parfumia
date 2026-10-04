import { db } from './database.js';

export function createWithdrawal(sellerId, amount) {
  const info = db.prepare('INSERT INTO withdrawals (seller_id, amount) VALUES (?, ?)').run(sellerId, amount);
  return { id: info.lastInsertRowid, sellerId, amount };
}

export function getWithdrawalsBySeller(sellerId) {
  return db.prepare('SELECT * FROM withdrawals WHERE seller_id = ? ORDER BY id').all(sellerId);
}

export function getBalance(sellerId) {
  const revenue = Number(
    db
      .prepare(
        `SELECT COALESCE(SUM(o.total), 0) AS revenue
         FROM orders o
         WHERE o.store_id IN (SELECT id FROM stores WHERE user_id = ?)
           AND o.status IN('paid','processed','shipped','completed')`
      )
      .get(sellerId)
      .revenue
  );
  const approved = Number(
    db
      .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM withdrawals WHERE seller_id = ? AND status = ?')
      .get(sellerId, 'approved')
      .total
  );
  return { revenue, approved, balance: revenue - approved };
}
