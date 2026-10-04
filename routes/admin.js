import { Router } from 'express';
import { requireRole } from '../middlewares/auth.js';
import {
  listUsersController,
  updateUserController,
  deleteUserController,
  listPendingSellersController,
  verifySellerController,
  listCategoriesController,
  createCategoryController,
  deleteCategoryController,
  listPendingProductsController,
  moderateProductController,
  deleteProductController,
  listAllOrdersController,
  listPendingPaymentsController,
  verifyPaymentController,
  listComplaintsController,
  resolveComplaintController,
  createVoucherController,
  reportsController,
} from '../controllers/adminController.js';

const router = Router();

router.use(requireRole('admin'));

router.get('/users', listUsersController);
router.put('/users/:id', updateUserController);
router.delete('/users/:id', deleteUserController);

router.get('/sellers/pending', listPendingSellersController);
router.put('/sellers/:id/verify', verifySellerController);

router.get('/categories', listCategoriesController);
router.post('/categories', createCategoryController);
router.delete('/categories/:id', deleteCategoryController);

router.get('/products/pending', listPendingProductsController);
router.put('/products/:id/moderate', moderateProductController);
router.delete('/products/:id', deleteProductController);

router.get('/orders', listAllOrdersController);

router.get('/payments/pending', listPendingPaymentsController);
router.put('/payments/:id/verify', verifyPaymentController);

router.get('/complaints', listComplaintsController);
router.put('/complaints/:id/resolve', resolveComplaintController);

router.post('/vouchers', createVoucherController);
router.get('/reports', reportsController);

export default router;
