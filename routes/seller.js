import { Router } from 'express';
import { requireRole } from '../middlewares/auth.js';
import {
  dashboardController,
  listMyProductsController,
  createProductController,
  getMyProductController,
  updateProductController,
  deleteProductController,
  updateStockController,
  listOrdersController,
  getOrderController,
  processOrderController,
  shipOrderController,
  listReviewsController,
  reportsController,
  balanceController,
  withdrawController,
  getStoreProfileController,
  updateStoreProfileController,
} from '../controllers/sellerController.js';

const router = Router();

router.use(requireRole('seller'));

router.get('/dashboard', dashboardController);
router.get('/products', listMyProductsController);
router.post('/products', createProductController);
router.get('/products/:id', getMyProductController);
router.put('/products/:id', updateProductController);
router.delete('/products/:id', deleteProductController);
router.put('/products/:id/stock', updateStockController);

router.get('/orders', listOrdersController);
router.get('/orders/:id', getOrderController);
router.put('/orders/:id/process', processOrderController);
router.put('/orders/:id/ship', shipOrderController);

router.get('/reviews', listReviewsController);
router.get('/reports', reportsController);
router.get('/balance', balanceController);
router.post('/withdrawals', withdrawController);
router.get('/store', getStoreProfileController);
router.put('/store', updateStoreProfileController);

export default router;
