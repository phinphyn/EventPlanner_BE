// routes/dashboardRoutes.js
import express from 'express';
import {
  getAdminDashboard,
  getUserDashboard,
} from '../controller/dashboardController.js';
import { validateToken, validateAdmin } from '../middleware/authMiddleware.js';
import {
  getOverviewStatsController,
  getRevenueAnalyticsController,
  getEventAnalyticsController,
  getUserAnalyticsController,
  getServiceAnalyticsController,
  getRoomAnalyticsController,
  getAllAnalyticsController,
} from '../controller/analyticsController.js';

const router = express.Router();

router.get('/admin', validateToken, validateAdmin, getAdminDashboard);
router.get('/user', validateToken, getUserDashboard);
router.get(
  '/revenue',
  validateToken,
  validateAdmin,
  getRevenueAnalyticsController
);

router.get(
  '/overview',
  validateToken,
  validateAdmin,
  getOverviewStatsController
);

// GET /api/analytics/events - Get event analytics
router.get(
  '/events',
  validateToken,
  validateAdmin,
  getEventAnalyticsController
);

// GET /api/analytics/users - Get user analytics
router.get('/users', validateToken, validateAdmin, getUserAnalyticsController);

// GET /api/analytics/services - Get service analytics
router.get(
  '/services',
  validateToken,
  validateAdmin,
  getServiceAnalyticsController
);

// GET /api/analytics/rooms - Get room analytics
router.get('/rooms', validateToken, validateAdmin, getRoomAnalyticsController);

router.get('/all', validateToken, validateAdmin, getAllAnalyticsController);

export default router;
