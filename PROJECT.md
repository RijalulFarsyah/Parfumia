# Parfumia — Perfume Marketplace (Backend Only)

## Stack (DO NOT CHANGE)
- Node.js 18+ ESM (`"type":"module"`)
- Express, express-session, bcrypt, better-sqlite3, cors, dotenv, multer
- SQLite at `data/parfumia.db`

## Roles
buyer | seller | admin

## Login (seeded)
admin/admin123, seller/seller123, buyer/buyer123
Login uses **username**, NOT email.

## STRICT RULES (violating any of these causes bugs)
1. Every `CREATE TABLE` uses `IF NOT EXISTS`. **Never use `DROP TABLE`.**
2. Every model file must export EVERY function its controller imports.
3. JSON uses camelCase. DB uses snake_case. Convert in the model layer.
4. Never expose `password_hash` in JSON.
5. Session: set `req.session.userId` and `req.session.role`, call `req.session.save(cb)` before responding. **Do NOT use `req.session.regenerate`.**
6. In SQL: if you write `FROM products p`, you may use `p.id`. If you write `FROM products`, do NOT use `p.id`. The number of `?` must equal the number of values passed to `.get/.all/.run`.
7. Checkout: server reads cart from DB. Client sends ONLY `{ address, courier, paymentMethod, voucherCode? }`. **Never trust client for prices, storeId, or items.**
8. `getUserById`-style helpers live in `models/users.js`. `models/database.js` ONLY exports `db`.
9. Seed scripts are idempotent (`DELETE FROM x` before insert, or `INSERT OR IGNORE`).
10. After writing any controller, list its imports and verify each is exported by the target model file.
11. Verify with `node --check <file>` only. **DO NOT start the server. DO NOT stream logs.**

## Folder Structure
```
models/  controllers/  routes/  middlewares/  scripts/  data/  uploads/  public/
server.js  package.json
```

## Database Schema

```sql
users(id, username UNIQUE, password_hash, role CHECK IN('buyer','seller','admin'), created_at)
stores(id, user_id UNIQUE, name, logo, description, address, verification_status CHECK IN('pending','approved','rejected'), created_at)
categories(id, name, type CHECK IN('brand','gender','concentration','aroma'))
products(id, store_id, name, brand, gender, concentration, volume_ml, top_notes, middle_notes, base_notes, price INT, stock INT DEFAULT 0, image, description, status CHECK IN('pending','approved','rejected') DEFAULT 'pending', created_at)
wishlists(id, user_id, product_id, created_at, UNIQUE(user_id,product_id))
carts(id, user_id, product_id, qty DEFAULT 1, UNIQUE(user_id,product_id))
orders(id, buyer_id, store_id, total, status CHECK IN('pending_payment','paid','processed','shipped','completed','cancelled') DEFAULT 'pending_payment', shipping_address, courier, payment_method, voucher_id, tracking_number, created_at)
order_items(id, order_id, product_id, qty, price)
payments(id, order_id, method, proof_image, status CHECK IN('pending','verified','rejected') DEFAULT 'pending', created_at)
reviews(id, product_id, user_id, rating CHECK 1..5, comment, created_at)
complaints(id, order_id, buyer_id, reason, status CHECK IN('open','resolved','rejected') DEFAULT 'open', created_at)
vouchers(id, code UNIQUE, discount REAL, min_purchase INT, valid_until, store_id, created_at)
withdrawals(id, seller_id, amount, status CHECK IN('pending','approved','rejected') DEFAULT 'pending', created_at)
messages(id, sender_id, receiver_id, order_id, content, is_read DEFAULT 0, created_at)
```