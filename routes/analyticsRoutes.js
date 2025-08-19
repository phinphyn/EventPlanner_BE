import express from 'express';
import { validateToken, validateAdmin } from '../middleware/authMiddleware.js';
import { getAnalytics } from '../controller/analyticsController.js';

const router = express.Router();

router.get('/admin', validateToken, validateAdmin, getAnalytics);

export default router;
