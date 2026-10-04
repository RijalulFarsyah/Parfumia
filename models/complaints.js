import { db } from './database.js';

export function addComplaint({ orderId, buyerId, reason }) {
  const info = db
    .prepare('INSERT INTO complaints (order_id, buyer_id, reason) VALUES (?, ?, ?)')
    .run(orderId, buyerId, reason);
  return { id: info.lastInsertRowid };
}

export function getComplaintsByUser(buyerId) {
  return db
    .prepare(
      `SELECT c.id, c.order_id, c.buyer_id, c.reason, c.status, c.created_at
       FROM complaints c
       WHERE c.buyer_id = ?
       ORDER BY c.id DESC`
    )
    .all(buyerId);
}
