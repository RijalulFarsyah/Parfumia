import { db } from './database.js';

export function createProduct(data) {
  const info = db
    .prepare(
      `INSERT INTO products
        (store_id, name, brand, gender, concentration, volume_ml, top_notes, middle_notes, base_notes, price, stock, image, description, status)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.store_id,
      data.name,
      data.brand,
      data.gender,
      data.concentration,
      data.volume_ml ?? null,
      data.top_notes ?? null,
      data.middle_notes ?? null,
      data.base_notes ?? null,
      data.price,
      data.stock ?? 0,
      data.image ?? null,
      data.description ?? null,
      data.status ?? 'pending'
    );
  return { id: info.lastInsertRowid, ...data };
}

export function getProductById(id, userId) {
  return db
    .prepare(
      `SELECT
        p.id, p.store_id, p.name, p.brand, p.gender, p.concentration,
        p.volume_ml, p.top_notes, p.middle_notes, p.base_notes,
        p.price, p.stock, p.image, p.description, p.status, p.created_at
       FROM products p
       WHERE p.id = ?`
    )
    .get(id, userId);
}

export function getProductByIdPublic(id) {
  return db
    .prepare(
      `SELECT
        p.id, p.store_id, p.name, p.brand, p.gender, p.concentration,
        p.volume_ml, p.top_notes, p.middle_notes, p.base_notes,
        p.price, p.stock, p.image, p.description, p.status, p.created_at
       FROM products p
       WHERE p.id = ?`
    )
    .get(id);
}

export function listProducts({ brand, gender, concentration, maxPrice, keyword, page = 1, limit = 20 }) {
  let params = [];
  let sql = `SELECT p.id, p.store_id, p.name, p.brand, p.gender, p.concentration,
               p.price, p.stock, p.image, p.description, p.status, p.created_at
          FROM products p WHERE 1=1`;
  const conditions = [];
  if (brand) {
    conditions.push('p.brand = ?');
    params.push(brand);
  }
  if (gender) {
    conditions.push('p.gender = ?');
    params.push(gender);
  }
  if (concentration) {
    conditions.push('p.concentration = ?');
    params.push(concentration);
  }
  if (maxPrice) {
    conditions.push('p.price <= ?');
    params.push(Number(maxPrice));
  }
  if (keyword) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ?');
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  return db.prepare(sql).all(...params);
}

export function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY id').all();
}

export function getCategoriesByType(type) {
  return db.prepare('SELECT * FROM categories WHERE type = ? ORDER BY id').all(type);
}

export function updateProduct(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['name', 'brand', 'gender', 'concentration', 'volume_ml', 'top_notes', 'middle_notes', 'base_notes', 'price', 'stock', 'image', 'description', 'status']) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getProductById(id);
  values.push(id);
  const info = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return { id, ...data };
}

export function deleteProduct(id) {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return info.changes > 0;
}

export function getProductsByStore(storeId) {
  return db
    .prepare(
      `SELECT
        p.id, p.store_id, p.name, p.brand, p.gender, p.concentration,
        p.volume_ml, p.top_notes, p.middle_notes, p.base_notes,
        p.price, p.stock, p.image, p.description, p.status, p.created_at
       FROM products p
       WHERE p.store_id = ?
       ORDER BY p.id`
    )
    .all(storeId);
}

export function updateProductStatus(id, status) {
  const info = db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}

export function countProductsByStore(storeId) {
  return Number(db.prepare('SELECT COUNT(*) AS c FROM products WHERE store_id = ?').get(storeId).c);
}

export function countProductsByStatus(status) {
  return Number(db.prepare('SELECT COUNT(*) AS c FROM products WHERE status = ?').get(status).c);
}

export function updateStock(id, stock) {
  const info = db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, id);
  return info.changes > 0;
}
