import { db } from './database.js';

export function createOrder(buyerId, storeId, total, status, shippingAddress, courier, paymentMethod, voucherId) {
  const info = db
    .prepare(
      `INSERT INTO orders
        (buyer_id, store_id, total, status, shipping_address, courier, payment_method, voucher_id)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(buyerId, storeId, total, status || 'pending_payment', shippingAddress, courier, paymentMethod, voucherId ?? null);
  return getOrderById(info.lastInsertRowid);
}

export function getOrdersByBuyer(buyerId) {
  return db
    .prepare(
      `SELECT
        o.id, o.buyer_id, o.store_id, o.total, o.status, o.shipping_address, o.courier,
        o.payment_method, o.voucher_id, o.tracking_number, o.created_at
       FROM orders o
       WHERE o.buyer_id = ?
       ORDER BY o.id DESC`
    )
    .all(buyerId);
}

export function getOrderById(id) {
  return db
    .prepare(
      `SELECT
        o.id, o.buyer_id, o.store_id, o.total, o.status, o.shipping_address, o.courier,
        o.payment_method, o.voucher_id, o.tracking_number, o.created_at
       FROM orders o
       WHERE o.id = ?`
    )
    .get(id);
}

export function getOrderItems(orderId) {
  return db
    .prepare(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.qty, oi.price
       FROM order_items oi
       WHERE oi.order_id = ?
       ORDER BY oi.id`
    )
    .all(orderId);
}

export function addOrderItem(orderId, productId, qty, price) {
  const info = db
    .prepare('INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)')
    .run(orderId, productId, qty, price);
  return { id: info.lastInsertRowid };
}

export function getOrdersByStore(storeId) {
  return db
    .prepare(
      `SELECT
        o.id, o.buyer_id, o.store_id, o.total, o.status, o.shipping_address, o.courier,
        o.payment_method, o.voucher_id, o.tracking_number, o.created_at
       FROM orders o
       WHERE o.store_id = ?
       ORDER BY o.id DESC`
    )
    .all(storeId);
}

export function updateOrderStatus(id, status) {
  const info = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}

export function countOrdersByStore(storeId, status) {
  return Number(db.prepare('SELECT COUNT(*) AS c FROM orders WHERE store_id = ? AND status = ?').get(storeId, status).c);
}

export function getRevenueByStore(storeId) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE store_id = ? AND status IN('paid','processed','shipped','completed')`
    )
    .get(storeId);
  return Number(row.revenue);
}
