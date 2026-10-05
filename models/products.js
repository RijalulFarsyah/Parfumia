import { db } from './database.js';

// ---------- Row mappers ----------
function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    store_id: row.store_id,
    name: row.name,
    brand: row.brand,
    gender: row.gender,
    concentration: row.concentration,
    volume_ml: row.volume_ml,
    top_notes: row.top_notes,
    middle_notes: row.middle_notes,
    base_notes: row.base_notes,
    price: row.price,
    stock: row.stock,
    image: row.image,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
  };
}

function toCategory(row) {
  if (!row) return null;
  return { id: row.id, name: row.name, type: row.type };
}

// ---------- Categories ----------
export function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY type, id').all().map(toCategory);
}

export function getCategoriesByType(type) {
  return db.prepare('SELECT * FROM categories WHERE type = ? ORDER BY id').all(type).map(toCategory);
}

export function getCategoriesByTypeAndName(type, name) {
  return db.prepare('SELECT * FROM categories WHERE type = ? AND lower(name) = lower(?)').get(type, name);
}

// ---------- Products: read ----------
export function listProducts(params = {}) {
  const { brand, gender, concentration, maxPrice, keyword, page = 1, limit = 20 } = params;
  const conditions = ["p.status = 'approved'"];
  const args = [];

  if (keyword) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)');
    const like = `%${keyword}%`;
    args.push(like, like, like);
  }
  if (brand) { conditions.push('p.brand = ?'); args.push(brand); }
  if (gender) { conditions.push('p.gender = ?'); args.push(gender); }
  if (concentration) { conditions.push('p.concentration = ?'); args.push(concentration); }
  if (maxPrice) { conditions.push('p.price <= ?'); args.push(Number(maxPrice)); }

  const sql = `SELECT p.* FROM products p WHERE ${conditions.join(' AND ')} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
  args.push(Number(limit), (Number(page) - 1) * Number(limit));

  return db.prepare(sql).all(...args).map(toProduct);
}

export function searchProducts(params = {}) {
  return listProducts(params);
}

export function getProductById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return toProduct(row);
}

export function getProductByIdPublic(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return toProduct(row);
}

export function getProductPreviewById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return toProduct(row);
}

export function getProductsByStore(storeId) {
  return db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY id DESC').all(storeId).map(toProduct);
}

export function countProductsByStore(storeId) {
  const row = db.prepare('SELECT COUNT(*) AS c FROM products WHERE store_id = ?').get(storeId);
  return row?.c ?? 0;
}

export function countProductsByStatus(status) {
  const row = db.prepare('SELECT COUNT(*) AS c FROM products WHERE status = ?').get(status);
  return row?.c ?? 0;
}

// ---------- Products: write ----------
export function createProduct(data) {
  const info = db.prepare(`
    INSERT INTO products
      (store_id, name, brand, gender, concentration, volume_ml,
       top_notes, middle_notes, base_notes, price, stock, image, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.store_id ?? data.storeId,
    data.name,
    data.brand ?? null,
    data.gender ?? null,
    data.concentration ?? null,
    data.volume_ml ?? data.volumeMl ?? null,
    data.top_notes ?? data.topNotes ?? null,
    data.middle_notes ?? data.middleNotes ?? null,
    data.base_notes ?? data.baseNotes ?? null,
    data.price,
    data.stock ?? 0,
    data.image ?? null,
    data.description ?? null,
    data.status ?? 'pending'
  );
  return getProductById(info.lastInsertRowid);
}

export function updateProduct(id, data) {
  const fields = [];
  const values = [];
  const map = {
    name: 'name',
    brand: 'brand',
    gender: 'gender',
    concentration: 'concentration',
    volume_ml: 'volume_ml',
    top_notes: 'top_notes',
    middle_notes: 'middle_notes',
    base_notes: 'base_notes',
    price: 'price',
    stock: 'stock',
    image: 'image',
    description: 'description',
    status: 'status',
  };
  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getProductById(id);
  values.push(id);
  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProductById(id);
}

export function deleteProduct(id) {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return info.changes > 0;
}

export function updateProductStatus(id, status) {
  const info = db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}

export function updateStock(id, stock) {
  const info = db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, id);
  return info.changes > 0;
}