import { db } from './database.js';

export function getVoucherByCode(code) {
  return db.prepare('SELECT * FROM vouchers WHERE code = ?').get(code);
}

export function getVoucherById(id) {
  return db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
}

export function listVouchers() {
  return db.prepare('SELECT * FROM vouchers ORDER BY id').all();
}

export function createVoucher({ code, discount, minPurchase, validUntil, storeId }) {
  const info = db
    .prepare('INSERT INTO vouchers (code, discount, min_purchase, valid_until, store_id) VALUES (?, ?, ?, ?, ?)')
    .run(code, discount, minPurchase, validUntil ?? null, storeId ?? null);
  return { id: info.lastInsertRowid, code, discount, minPurchase, validUntil, storeId };
}

export function getVouchersByStore(storeId) {
  return db.prepare('SELECT * FROM vouchers WHERE store_id = ? ORDER BY id').all(storeId);
}
