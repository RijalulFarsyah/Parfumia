import {
  getProductById,
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  countProductsByStore,
  countProductsByStatus,
  updateStock,
} from '../models/products.js';
import {
  createOrder,
  getOrdersByStore,
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  countOrdersByStore,
  getRevenueByStore,
} from '../models/orders.js';
import { getReviewsForStore, addReview } from '../models/reviews.js';
import { getWithdrawalsBySeller, getBalance, createWithdrawal } from '../models/withdrawals.js';
import { findUserByUsername } from '../models/users.js';
import { db } from '../models/database.js';

export function dashboardController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const stats = {
    productCount: countProductsByStore(store.id),
    pendingOrders: countOrdersByStore(store.id, 'pending_payment'),
    completedOrders: countOrdersByStore(store.id, 'completed'),
    revenue: getRevenueByStore(store.id),
  };

  res.json({ store: { id: store.id }, stats });
}

export function listMyProductsController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  res.json({ products: getProductsByStore(store.id) });
}

export function createProductController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const { name, brand, gender, concentration, price, stock, description } = req.body ?? {};
  if (!name || !brand || !gender || !concentration || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'name, brand, gender, concentration, price and stock are required' });
  }

  const product = createProduct({
    store_id: store.id,
    name,
    brand,
    gender,
    concentration,
    price,
    stock,
    description,
  });
  res.status(201).json({ product });
}

export function getMyProductController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const product = getProductById(parseInt(req.params.id, 10), userId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
}

export function updateProductController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const product = getProductById(parseInt(req.params.id, 10), userId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  const data = req.body ?? {};
  const updated = updateProduct(parseInt(req.params.id, 10), data);
  res.json({ product: updated });
}

export function deleteProductController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const product = getProductById(parseInt(req.params.id, 10), userId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  const ok = deleteProduct(parseInt(req.params.id, 10));
  res.json({ ok });
}

export function updateStockController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const product = getProductById(parseInt(req.params.id, 10), userId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  const { stock } = req.body ?? {};
  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: 'stock is required and must be >= 0' });
  }

  updateStock(parseInt(req.params.id, 10), stock);
  res.json({ ok: true });
}

export function listOrdersController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  res.json({ orders: getOrdersByStore(store.id) });
}

export function getOrderController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const order = getOrderById(parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  res.json({ order, items: getOrderItems(order.id) });
}

export function processOrderController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const order = getOrderById(parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!['paid', 'processed', 'shipped', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  updateOrderStatus(order.id, status);
  res.json({ order: getOrderById(order.id) });
}

export function shipOrderController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const order = getOrderById(parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.store_id !== store.id) return res.status(403).json({ error: 'Forbidden' });

  if (order.status !== 'processed') {
    return res.status(400).json({ error: 'Order must be processed before shipping' });
  }

  updateOrderStatus(order.id, 'shipped');
  res.json({ order: getOrderById(order.id) });
}

export function listReviewsController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  res.json({ reviews: getReviewsForStore(store.id) });
}

export function reportsController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const store = db.prepare('SELECT id FROM stores WHERE user_id = ?').get(userId);
  if (!store) return res.status(400).json({ error: 'Store not found' });

  const stats = {
    totalOrders: countOrdersByStore(store.id),
    pendingOrders: countOrdersByStore(store.id, 'pending_payment'),
    paidOrders: countOrdersByStore(store.id, 'paid'),
    completedOrders: countOrdersByStore(store.id, 'completed'),
    revenue: getRevenueByStore(store.id),
  };

  res.json({ store: { id: store.id }, stats });
}

export function balanceController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const withdrawal = getBalance(userId);
  res.json({ withdrawal });
}

export function withdrawController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const { amount } = req.body ?? {};
  if (amount === undefined || amount <= 0) {
    return res.status(400).json({ error: 'amount is required and must be > 0' });
  }

  const withdrawal = createWithdrawal(userId, amount);
  res.status(201).json({ withdrawal });
}
