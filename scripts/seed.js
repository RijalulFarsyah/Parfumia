import bcrypt from 'bcrypt';
import { db } from '../models/database.js';

const seedUser = (username, password, role) => {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    console.log(`Seeded user ${username} (already exists)`);
    return existing.id;
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
  ).run(username, hash, role);
  console.log(`Seeded user ${username}`);
  return info.lastInsertRowid;
};

const seedStore = (userId, name, status) => {
  const info = db.prepare(
    'INSERT INTO stores (user_id, name, verification_status) VALUES (?, ?, ?)'
  ).run(userId, name, status);
  console.log(`Seeded store ${name}`);
  return info.lastInsertRowid;
};

const seedCategory = (name, type) => {
  db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
  console.log(`Seeded category ${name} (${type})`);
};

const seedProduct = (storeId, data) => {
  const info = db.prepare(
    `INSERT INTO products
       (store_id, name, brand, gender, concentration, volume_ml,
        top_notes, middle_notes, base_notes, price, stock, image, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    storeId,
    data.name,
    data.brand,
    data.gender,
    data.concentration,
    data.volume_ml,
    data.top_notes,
    data.middle_notes,
    data.base_notes,
    data.price,
    data.stock,
    data.image,
    data.description,
    data.status
  );
  console.log(`Seeded product ${data.name}`);
  return info.lastInsertRowid;
};

const seedVoucher = (code, discount, minPurchase, validUntil, storeId) => {
  db.prepare(
    'INSERT INTO vouchers (code, discount, min_purchase, valid_until, store_id) VALUES (?, ?, ?, ?, ?)'
  ).run(code, discount, minPurchase, validUntil, storeId);
  console.log(`Seeded voucher ${code}`);
};

// --- Main seed ---
try {
  // Clear in FK-safe order
  db.prepare('DELETE FROM payments').run();
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM carts').run();
  db.prepare('DELETE FROM wishlists').run();
  db.prepare('DELETE FROM reviews').run();
  db.prepare('DELETE FROM complaints').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM vouchers').run();
  db.prepare('DELETE FROM categories').run();
  db.prepare('DELETE FROM stores').run();
  db.prepare('DELETE FROM users').run();

  // 1. Users
  const adminId = seedUser('admin', 'admin123', 'admin');
  const sellerId = seedUser('seller', 'seller123', 'seller');
  const buyerId = seedUser('buyer', 'buyer123', 'buyer');

  // 2. Store (use actual sellerId, not hardcoded)
  const storeId = seedStore(sellerId, 'Parfumia Store', 'approved');

  // 3. Categories
  for (const name of ['Dior', 'Chanel', 'Prada', 'YSL']) {
    seedCategory(name, 'brand');
  }
  for (const name of ['Men', 'Women', 'Unisex']) {
    seedCategory(name, 'gender');
  }
  for (const name of ['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne']) {
    seedCategory(name, 'concentration');
  }
  for (const name of ['Floral', 'Woody', 'Citrus', 'Gourmand', 'Oriental']) {
    seedCategory(name, 'aroma');
  }

  // 4. Products (use storeId variable)
  const products = [
    {
      name: 'Sauvage', brand: 'Dior', gender: 'Men', concentration: 'Eau de Toilette',
      volume_ml: 100, top_notes: 'Bergamot', middle_notes: 'Sichuan Pepper',
      base_notes: 'Ambroxan', price: 185000, stock: 90, image: null,
      description: 'Fresh spicy modern fragrance', status: 'approved',
    },
    {
      name: 'Bleu de Chanel', brand: 'Chanel', gender: 'Men', concentration: 'Eau de Parfum',
      volume_ml: 100, top_notes: 'Citrus', middle_notes: 'Lavender',
      base_notes: 'Cedar', price: 165000, stock: 85, image: null,
      description: 'Woody aromatic signature', status: 'approved',
    },
    {
      name: 'Chanel No. 5', brand: 'Chanel', gender: 'Women', concentration: 'Parfum',
      volume_ml: 50, top_notes: 'Aldehydes', middle_notes: 'Jasmine',
      base_notes: 'Sandalwood', price: 220000, stock: 60, image: null,
      description: 'Timeless floral classic', status: 'approved',
    },
    {
      name: 'Coco Mademoiselle', brand: 'Chanel', gender: 'Women', concentration: 'Eau de Parfum',
      volume_ml: 50, top_notes: 'Orange', middle_notes: 'Rose',
      base_notes: 'Patchouli', price: 195000, stock: 70, image: null,
      description: 'Fresh oriental for women', status: 'approved',
    },
    {
      name: 'Luna Rossa Ocean', brand: 'Prada', gender: 'Men', concentration: 'Eau de Toilette',
      volume_ml: 100, top_notes: 'Sea Salt', middle_notes: 'Lavender',
      base_notes: 'Amber', price: 175000, stock: 55, image: null,
      description: 'Aquatic fougere', status: 'approved',
    },
    {
      name: 'Libre', brand: 'YSL', gender: 'Women', concentration: 'Eau de Parfum',
      volume_ml: 50, top_notes: 'Mandarin', middle_notes: 'Lavender',
      base_notes: 'Vanilla', price: 210000, stock: 40, image: null,
      description: 'Floral lavender blend', status: 'approved',
    },
  ];

  for (const p of products) {
    seedProduct(storeId, p);
  }

  // 5. Voucher (platform-wide, store_id = null)
  seedVoucher('PARFUM10', 0.1, 100000, '2026-12-31', null);

  console.log('Seed complete');
} catch (err) {
  console.error('Seed failed:', err);
  process.exit(1);
}