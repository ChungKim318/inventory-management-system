import { Router } from 'express';
import {
  createProduct,
  editProduct,
  getProducts,
  // deleteProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:productId', editProduct);
// router.delete('/:productId', deleteProduct);

export default router;
