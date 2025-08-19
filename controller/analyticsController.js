import { getEventServiceStats } from '../service/event_service.service.js';
import { getPaymentStats } from '../service/payment.service.js';
import { getInvoiceStats } from '../service/invoice.service.js';
import { sendResponse } from '../utils/response.js';

import {
  getOverviewStats,
  getRevenueAnalytics,
  getEventAnalytics,
  getUserAnalytics,
  getServiceAnalytics,
  getRoomAnalytics,
} from '../service/analytics.service.js';

export const getAnalytics = async (req, res) => {
  try {
    const [eventServiceStats, paymentStats, invoiceStats] = await Promise.all([
      getEventServiceStats(),
      getPaymentStats(),
      getInvoiceStats(),
    ]);
    return sendResponse(res, 200, 'Analytics fetched successfully', {
      eventServiceStats,
      paymentStats,
      invoiceStats,
    });
  } catch (error) {
    return sendResponse(res, 500, 'Failed to fetch analytics');
  }
};

export const getOverviewStatsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const result = await getOverviewStats(period);

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'Overview statistics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve overview statistics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getOverviewStatsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get Revenue Analytics =====
export const getRevenueAnalyticsController = async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await getRevenueAnalytics({ month, year });

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'Revenue analytics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve revenue analytics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getRevenueAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get Event Analytics =====
export const getEventAnalyticsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const result = await getEventAnalytics(period);

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'Event analytics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve event analytics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getEventAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get User Analytics =====
export const getUserAnalyticsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const result = await getUserAnalytics(period);

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'User analytics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve user analytics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getUserAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get Service Analytics =====
export const getServiceAnalyticsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const result = await getServiceAnalytics(period);

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'Service analytics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve service analytics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getServiceAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get Room Analytics =====
export const getRoomAnalyticsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const result = await getRoomAnalytics(period);

    if (result.isValid) {
      res.status(200).json({
        success: true,
        message: 'Room analytics retrieved successfully',
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve room analytics',
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Error in getRoomAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};

// ===== Get All Analytics (Dashboard) =====
export const getAllAnalyticsController = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const [
      overviewResult,
      revenueResult,
      eventResult,
      userResult,
      serviceResult,
      roomResult,
    ] = await Promise.all([
      getOverviewStats(period),
      getRevenueAnalytics(period),
      getEventAnalytics(period),
      getUserAnalytics(period),
      getServiceAnalytics(period),
      getRoomAnalytics(period),
    ]);

    const data = {
      overview: overviewResult.isValid ? overviewResult.data : null,
      revenue: revenueResult.isValid ? revenueResult.data : null,
      events: eventResult.isValid ? eventResult.data : null,
      users: userResult.isValid ? userResult.data : null,
      services: serviceResult.isValid ? serviceResult.data : null,
      rooms: roomResult.isValid ? roomResult.data : null,
      period,
    };

    res.status(200).json({
      success: true,
      message: 'All analytics retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('Error in getAllAnalyticsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message],
    });
  }
};
