import { db } from '../models/database.js';
import { findUserById, findUserByUsername, updateUserRole, createUser } from '../models/users.js';
import {
  getProductsByStore,
  getProductById,
  updateProductStatus,
  countProductsByStore,
} from '../models/products.js';
import {
  getOrdersByStore,
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  countOrdersByStore,
} from '../models/orders.js';
import { getPaymentByOrder, updatePaymentStatus } from '../models/payments.js';
import { getComplaintsByUser, addComplaint } from '../models/complaints.js';
import {
  listCategories,
  getCategoryById,
  addCategory,
  getCategoriesByType,
} from '../models/categories.js';
import { getBalance, getWithdrawalsBySeller } from '../models/withdrawals.js';
import { listVouchers, getVoucherById, createVoucher } from '../models/vouchers.js';

export function listUsersController(req, res) {
  const rows = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY id').all();
  res.json({ users: rows });
}

export function updateUserController(req, res) {
  const { id } = req.params;
  const { role } = req.body ?? {};
  if (!role) return res.status(400).json({ error: 'role is required' });
  if (!['buyer', 'seller', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = findUserById(parseInt(id, 10));
  if (!user) return res.status(404).json({ error: 'User not found' });
  updateUserRole(parseInt(id, 10), role);
  res.json({ user: findUserById(parseInt(id, 10)) });
}

export function deleteUserController(req, res) {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(parseInt(id, 10));
  if (info.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
}

export function listPendingSellersController(req, res) {
  const rows = db.prepare("SELECT u.id, u.username, u.role, s.id AS store_id, s.verification_status, s.name AS store_name FROM users u LEFT JOIN stores s ON s.user_id = u.id WHERE u.role = 'seller' AND s.verification_status = 'pending' ORDER BY u.id").all();
  res.json({ sellers: rows });
}

export function verifySellerController(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const store = db.prepare('SELECT id, user_id FROM stores WHERE user_id = ?').get(parseInt(id, 10));
  if (!store) return res.status(404).json({ error: 'Store not found' });
  const info = db.prepare('UPDATE stores SET verification_status = ? WHERE id = ?').run(status, store.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Store not found' });
  if (status === 'approved') {
    updateUserRole(store.user_id, 'seller');
  }
  res.json({ ok: true });
}

export function listCategoriesController(req, res) {
  const { type } = req.query;
  const rows = type ? getCategoriesByType(type) : listCategories();
  res.json({ categories: rows });
}

export function createCategoryController(req, res) {
  const { name, type } = req.body ?? {};
  if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
  if (!['brand', 'gender', 'concentration', 'aroma'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
  const category = addCategory({ name, type });
  res.status(201).json({ category });
}

export function deleteCategoryController(req, res) {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM categories WHERE id = ?').run(parseInt(id, 10));
  if (info.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ ok: true });
}

export function listPendingProductsController(req, res) {
  const rows = db.prepare("SELECT p.id, p.store_id, s.name AS store_name, p.name, p.brand, p.status FROM products p JOIN stores s ON s.id = p.store_id WHERE p.status = 'pending' ORDER BY p.id").all();
  res.json({ products: rows });
}

export function moderateProductController(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const product = getProductById(parseInt(id, 10));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  updateProductStatus(parseInt(id, 10), status);
  res.json({ ok: true });
}

export function deleteProductController(req, res) {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(parseInt(id, 10));
  if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
}

export function listAllOrdersController(req, res) {
  const rows = db.prepare('SELECT o.id, o.buyer_id, o.store_id, o.total, o.status, o.created_at, u.username AS buyer_name FROM orders o JOIN users u ON u.id = o.buyer_id ORDER BY o.id DESC').all();
  res.json({ orders: rows });
}

export function listPendingPaymentsController(req, res) {
  const rows = db.prepare("SELECT p.id, p.order_id, p.method, p.status, o.id AS order_d, u.username AS buyer_name FROM payments p JOIN orders o ON o.id = p.order_id JOIN users u ON u.id = o.buyer_id WHERE p.status = 'pending' ORDER BY p.id").all();
  res.json({ payments: rows });
}

export function verifyPaymentController(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const payment = getPaymentByOrder(parseInt(id, 10));
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  updatePaymentStatus(parseInt(id, 10), status);
  res.json({ ok: true });
}

export function listComplaintsController(req, res) {
  const rows = db.prepare("SELECT c.id, c.order_id, c.buyer_id, c.reason, c.status, c.created_at, u.username AS buyer_name FROM complaints c JOIN users u ON u.id = c.buyer_id ORDER BY c.id DESC").all();
  res.json({ complaints: rows });
}

export function resolveComplaintController(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!['resolved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const info = db.prepare("UPDATE complaints SET status = ? WHERE id = ?").run(status, parseInt(id, 10));
  if (info.changes === 0) return res.status(404).json({ error: 'Complaint not found' });
  res.json({ ok: true });
}

export function createVoucherController(req, res) {
  const { code, discount, minPurchase, validUntil, storeId } = req.body ?? {};
  if (!code || discount === undefined || minPurchase === undefined || !validUntil) {
    return res.status(400).json({ error: 'code, discount, minPurchase and validUntil are required' });
  }
  const voucher = createVoucher({ code, discount, minPurchase, validUntil, storeId });
  res.status(201).json({ voucher });
}

export function reportsController(req, res) {
  const stats = {
    totalUsers: Number(db.prepare('SELECT COUNT(*) AS c FROM users').get().c),
    totalSellers: Number(db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'seller'").get().c),
    totalBuyers: Number(db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'buyer'").get().c),
    totalProducts: Number(db.prepare('SELECT COUNT(*) AS c FROM products').get().c),
    totalOrders: Number(db.prepare('SELECT COUNT(*) AS c FROM orders').get().c),
    pendingOrders: Number(db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending_payment'").get().c),
    totalRevenue: Number(db.prepare("SELECT COALESCE(SUM(total), 0) AS c FROM orders WHERE status IN('paid','processed','shipped','completed')").get().c),
  };
  res.json({ stats });
}
