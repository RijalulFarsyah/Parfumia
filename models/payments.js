import { db } from './database.js';

export function createPayment(orderId, method, proofImage) {
  const info = db
    .prepare('INSERT INTO payments (order_id, method, proof_image) VALUES (?, ?, ?)')
    .run(orderId, method, proofImage ?? null);
  return getPaymentByOrder(orderId);
}

export function getPaymentByOrder(orderId) {
  return db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
}

export function updatePaymentStatus(id, status) {
  const info = db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}
