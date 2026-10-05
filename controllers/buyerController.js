import {
  getProductById,
  getProductByIdPublic,
  getCategories,
  getCategoriesByType,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByStore,
  updateProductStatus,
  countProductsByStore,
  countProductsByStatus,
  updateStock,
} from '../models/products.js';
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getWishlistItems,
  getWishlistCount,
} from '../models/wishlist.js';
import {
  getCartItems,
  getCartCount,
  getCartItem,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  getCartTotal,
} from '../models/cart.js';
import {
  createOrder,
  getOrdersByBuyer,
  getOrderById,
  getOrderItems,
  addOrderItem,
  getOrdersByStore,
  updateOrderStatus,
  countOrdersByStore,
  getRevenueByStore,
} from '../models/orders.js';
import { createPayment, getPaymentByOrder, updatePaymentStatus } from '../models/payments.js';
import { getReviewsByProduct, addReview, getReviewsForStore } from '../models/reviews.js';
import { addComplaint, getComplaintsByUser } from '../models/complaints.js';
import {
  getVoucherByCode,
  getVoucherById,
  listVouchers,
  createVoucher,
  getVouchersByStore,
} from '../models/vouchers.js';
import { createWithdrawal, getWithdrawalsBySeller, getBalance } from '../models/withdrawals.js';
import { db } from '../models/database.js';
import { findUserByUsername } from '../models/users.js';
import { listAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../models/addresses.js';
import { listActiveBanners } from '../models/banners.js';

export function listProductsController(req, res) {
  const { brand, gender, concentration, maxPrice, keyword, page = 1, limit = 20 } = req.query;
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
    conditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const rows = db.prepare(sql).all(...params);
  res.json({ products: rows });
}

export function getProductController(req, res) {
  const product = getProductByIdPublic(parseInt(req.params.id, 10));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
}

export function getCategoriesController(req, res) {
  const { type } = req.query;
  const categories = type ? getCategoriesByType(type) : getCategories();
  res.json({ categories });
}

export function toggleWishlistController(req, res) {
  const { productId } = req.params;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const inWishlist = isInWishlist(userId, parseInt(productId, 10));
  if (inWishlist) {
    removeFromWishlist(userId, parseInt(productId, 10));
    return res.json({ added: false });
  }
  addToWishlist(userId, parseInt(productId, 10));
  res.json({ added: true });
}

export function getWishlistController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json({ items: getWishlistItems(userId), count: getWishlistCount(userId) });
}

export function clearWishlistController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  db.prepare('DELETE FROM wishlists WHERE user_id = ?').run(userId);
  res.json({ ok: true });
}

export function addToCartController(req, res) {
  const { productId, qty = 1 } = req.body ?? {};
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  if (!productId || typeof qty !== 'number' || qty < 1) {
    return res.status(400).json({ error: 'Invalid qty' });
  }
  addToCart(userId, parseInt(productId, 10), qty);
  res.json({ ok: true });
}

export function removeFromCartController(req, res) {
  const { productId } = req.params;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  removeFromCart(userId, parseInt(productId, 10));
  res.json({ ok: true });
}

export function updateCartQtyController(req, res) {
  const userId = req.session.userId;
  const { productId, qty } = req.body ?? {};
  if (!productId || !Number.isInteger(Number(productId)) || Number(productId) < 1) {
    return res.status(400).json({ error: 'productId is required' });
  }
  if (!Number.isInteger(Number(qty)) || Number(qty) < 1) {
    return res.status(400).json({ error: 'qty must be a positive integer' });
  }
  updateCartQty(userId, Number(productId), Number(qty));
  res.json({ ok: true });
}

export function getCartController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json({ items: getCartItems(userId), count: getCartCount(userId), total: getCartTotal(userId) });
}

export function clearCartController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  clearCart(userId);
  res.json({ ok: true });
}

export function placeOrderController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const { address, courier, paymentMethod, voucherCode } = req.body ?? {};
  if (!address || !courier || !paymentMethod) {
    return res.status(400).json({ error: 'address, courier and paymentMethod are required' });
  }

  const cartItems = getCartItems(userId);
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.stock < item.qty) {
      return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    }
  }

  const first = cartItems[0];
  const storeId = db.prepare('SELECT store_id FROM products WHERE id = ?').get(first.product_id).store_id;

  let subtotal = 0;
  for (const item of cartItems) {
    subtotal += item.price * item.qty;
  }

  let voucherDiscount = 0;
  let voucherId = null;
  if (voucherCode) {
    const voucher = getVoucherByCode(voucherCode);
    if (voucher) {
      const now = new Date();
      const validUntil = new Date(voucher.valid_until);
      if (validUntil > now && voucher.min_purchase <= subtotal) {
        voucherDiscount = Math.round(subtotal * voucher.discount);
        voucherId = voucher.id;
      }
    }
  }

  const order = createOrder(
    userId,
    storeId,
    Math.max(subtotal - voucherDiscount, 0),
    'pending_payment',
    address,
    courier,
    paymentMethod,
    voucherId
  );

  for (const item of cartItems) {
    addOrderItem(order.id, item.product_id, item.qty, item.price);
    updateStock(item.product_id, item.stock - item.qty);
  }

  clearCart(userId);

  res.status(201).json({ order: getOrderById(order.id) });
}

export function getOrdersController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json({ orders: getOrdersByBuyer(userId) });
}

export function getOrderController(req, res) {
  const order = getOrderById(parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order, items: getOrderItems(order.id) });
}

export function confirmReceivedController(req, res) {
  const order = getOrderById(parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'shipped') {
    return res.status(400).json({ error: 'Order is not shipped' });
  }
  updateOrderStatus(order.id, 'completed');
  res.json({ order: getOrderById(order.id) });
}

export function addReviewController(req, res) {
  const { productId, rating, comment } = req.body ?? {};
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }
  addReview({ productId, userId, rating, comment });
  res.json({ ok: true });
}

export function addComplaintController(req, res) {
  const { orderId, reason } = req.body ?? {};
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  if (!orderId || !reason) {
    return res.status(400).json({ error: 'orderId and reason are required' });
  }
  addComplaint({ orderId, buyerId: userId, reason });
  res.json({ ok: true });
}

export function getVouchersController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json({ vouchers: listVouchers() });
}

export function listAddressesController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json({ addresses: listAddresses(userId) });
}

export function addAddressController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const { label, fullAddress, city, postalCode, isDefault = 0 } = req.body ?? {};
  if (!label || !fullAddress || !city || !postalCode) {
    return res.status(400).json({ error: 'label, fullAddress, city and postalCode are required' });
  }
  const address = addAddress(userId, { label, fullAddress, city, postalCode, isDefault });
  res.status(201).json({ address });
}

export function updateAddressController(req, res) {
  const { id } = req.params;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const data = req.body ?? {};
  const address = updateAddress(parseInt(id, 10), userId, data);
  if (!address) return res.status(404).json({ error: 'Address not found' });
  res.json({ address });
}

export function deleteAddressController(req, res) {
  const { id } = req.params;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const ok = deleteAddress(parseInt(id, 10), userId);
  if (!ok) return res.status(404).json({ error: 'Address not found' });
  res.json({ ok: true });
}

export function setDefaultAddressController(req, res) {
  const { id } = req.params;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const ok = setDefaultAddress(userId, parseInt(id, 10));
  if (!ok) return res.status(404).json({ error: 'Address not found' });
  res.json({ ok: true });
}

export function getProfileController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const user = findUserByUsername(
    db.prepare('SELECT username FROM users WHERE id = ?').get(userId).username
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
}

export function updateProfileController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const data = req.body ?? {};

  if (data.username !== undefined) {
    const existing = findUserByUsername(data.username);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(data.username, userId);
  }

  if (data.password !== undefined) {
    const hash = bcrypt.hashSync(data.password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  }

  const user = findUserByUsername(db.prepare('SELECT username FROM users WHERE id = ?').get(userId).username);
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
}

export function uploadPaymentController(req, res) {
  const { order_id, proof_image } = req.body ?? {};
  if (!order_id) return res.status(400).json({ error: 'order_id is required' });
  const payment = createPayment(order_id, req.file?.path || 'uploaded', req.file?.filename || null);
  res.status(201).json({ payment });
}

export function getPaymentStatusController(req, res) {
  const payment = getPaymentByOrder(parseInt(req.params.orderId, 10));
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json({ payment });
}

export function listActiveBannersController(req, res) {
  res.json({ banners: listActiveBanners() });
}