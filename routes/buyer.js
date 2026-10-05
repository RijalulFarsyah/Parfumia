import { Router } from 'express';
import { requireRole } from '../middlewares/auth.js';
import {
  listProductsController,
  getProductController,
  getCategoriesController,
  toggleWishlistController,
  getWishlistController,
  clearWishlistController,
  addToCartController,
  updateCartQtyController,
  removeFromCartController,
  getCartController,
  clearCartController,
  placeOrderController,
  getOrdersController,
  getOrderController,
  confirmReceivedController,
  addReviewController,
  addComplaintController,
  getVouchersController,
  listAddressesController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
  getProfileController,
  updateProfileController,
  uploadPaymentController,
  getPaymentStatusController,
  listActiveBannersController,
} from '../controllers/buyerController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(requireRole('buyer'));

router.get('/products', listProductsController);
router.get('/products/:id', getProductController);
router.get('/categories', getCategoriesController);
router.put('/wishlist/:productId', toggleWishlistController);
router.get('/wishlist', getWishlistController);
router.delete('/wishlist', clearWishlistController);

router.post('/cart', addToCartController);
router.put('/cart', updateCartQtyController);
router.put('/cart/:productId', removeFromCartController);
router.put('/cart/qty/:productId', addToCartController);
router.get('/cart', getCartController);
router.delete('/cart/clear', clearCartController);
router.delete('/cart/:productId', removeFromCartController);

router.post('/orders', placeOrderController);
router.get('/orders', getOrdersController);
router.get('/orders/:id', getOrderController);
router.put('/orders/:id/confirm-received', confirmReceivedController);
router.post('/reviews', addReviewController);
router.post('/complaints', addComplaintController);
router.get('/vouchers', getVouchersController);
router.get('/banners', listActiveBannersController);

router.get('/addresses', listAddressesController);
router.post('/addresses', addAddressController);
router.put('/addresses/:id', updateAddressController);
router.delete('/addresses/:id', deleteAddressController);
router.put('/addresses/:id/default', setDefaultAddressController);

router.get('/profile', getProfileController);
router.put('/profile', updateProfileController);

router.post('/payments', upload.single('proof_image'), uploadPaymentController);
router.get('/payments/:orderId', getPaymentStatusController);

export default router;
