import express from 'express';
import { 
  getBlogs, 
  getBlogById, 
  getBlogBySlug,
  createBlog, 
  updateBlog, 
  deleteBlog 
} from '../controllers/blogController.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
