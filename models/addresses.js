import { db } from './database.js';

export function listAddresses(userId) {
  return db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY id').all(userId);
}

export function addAddress(userId, { label, fullAddress, city, postalCode, isDefault = 0 }) {
  const info = db
    .prepare('INSERT INTO addresses (user_id, label, full_address, city, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, label, fullAddress, city, postalCode, isDefault);
  return { id: info.lastInsertRowid, ...{ label, fullAddress, city, postalCode, isDefault: Boolean(isDefault) } };
}

export function updateAddress(id, userId, data) {
  const allowed = ['label', 'full_address', 'city', 'postal_code', 'is_default'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      let value = data[key];
      if (key === 'is_default') value = Boolean(value) ? 1 : 0;
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (updates.length === 0) return null;
  values.push(id, userId);
  const info = db.prepare(`UPDATE addresses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  return info.changes > 0 ? { id, ...data } : null;
}

export function deleteAddress(id, userId) {
  const info = db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, userId);
  return info.changes > 0;
}

export function setDefaultAddress(userId, addressId) {
  db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
  const info = db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(addressId, userId);
  return info.changes > 0;
}
