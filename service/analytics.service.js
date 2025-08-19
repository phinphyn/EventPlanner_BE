// ===== System Revenue Analytics (Flexible by Year/Month) =====
/**
 * Get system revenue grouped by month (for a year) or by day (for a month).
 * @param {Object} params - { year?: number, month?: number }
 * @returns {Promise<{ isValid: boolean, data: Array<{ label: string, revenue: number }> }>}
 */
export const getSystemRevenue = async (params = {}) => {
  try {
    const now = new Date();
    let { year, month } = params;
    let startDate, endDate, groupBy;

    if (!year && !month) {
      year = now.getFullYear();
    }

    if (year && !month) {
      startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      endDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);
      groupBy = 'month';
    } else if (year && month) {
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      endDate = new Date(year, month, 1, 0, 0, 0, 0);
      groupBy = 'day';
    } else {
      year = now.getFullYear();
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      endDate = new Date(year, month, 1, 0, 0, 0, 0);
      groupBy = 'day';
    }

    const validStatuses = [
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'RESCHEDULED',
    ];

    let groupByFields, result;
    if (groupBy === 'month') {
      // Group by month
      result = await prisma.event.groupBy({
        by: ['month'],
        where: {
          date_create: { gte: startDate, lt: endDate },
          status: { in: validStatuses },
        },
        _sum: { final_cost: true },
        // Prisma does not support extracting month directly, so we do it in JS below
      });
      // Map month from date_create
      const events = await prisma.event.findMany({
        where: {
          date_create: { gte: startDate, lt: endDate },
          status: { in: validStatuses },
        },
        select: { final_cost: true, date_create: true },
      });
      const monthMap = {};
      for (const ev of events) {
        const m = new Date(ev.date_create).getMonth() + 1;
        monthMap[m] = (monthMap[m] || 0) + Number(ev.final_cost || 0);
      }
      let data = [];
      for (let m = 1; m <= 12; m++) {
        data.push({ label: `${m}`, revenue: monthMap[m] || 0 });
      }
      return createValidationResult(true, [], data);
    } else {
      // Group by day
      const daysInMonth = new Date(year, month, 0).getDate();
      const events = await prisma.event.findMany({
        where: {
          date_create: { gte: startDate, lt: endDate },
          status: { in: validStatuses },
        },
        select: { final_cost: true, date_create: true },
      });
      const dayMap = {};
      for (const ev of events) {
        const d = new Date(ev.date_create).getDate();
        dayMap[d] = (dayMap[d] || 0) + Number(ev.final_cost || 0);
      }
      let data = [];
      for (let d = 1; d <= daysInMonth; d++) {
        data.push({ label: `${d}`, revenue: dayMap[d] || 0 });
      }
      return createValidationResult(true, [], data);
    }
  } catch (error) {
    return handleError('getSystemRevenue', error);
  }
};
import { PrismaClient } from '@prisma/client';
import { createValidationResult } from '../utils/validation.js';

const prisma = new PrismaClient();

// ===== Helper Functions =====
const handleError = (context, error) => {
  console.error(`Error in ${context}:`, error);
  return createValidationResult(false, [error.message]);
};

const getDateRange = (period = '30d') => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { startDate, endDate: now };
};

// ===== Overview Statistics =====
export const getOverviewStats = async (period = '30d') => {
  try {
    const { startDate, endDate } = getDateRange(period);

    const [
      totalUsers,
      totalEvents,
      totalRevenue,
      activeEvents,
      completedEvents,
      cancelledEvents,
      totalServices,
      totalRooms,
    ] = await Promise.all([
      // Total users
      prisma.account.count({
        where: {
          date_create: { gte: startDate, lte: endDate },
          is_active: true,
        },
      }),

      // Total events
      prisma.event.count({
        where: {
          date_create: { gte: startDate, lte: endDate },
        },
      }),

      // Total revenue
      prisma.event.aggregate({
        where: {
          date_create: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { final_cost: true },
      }),

      // Active events
      prisma.event.count({
        where: {
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
      }),

      // Completed events
      prisma.event.count({
        where: {
          status: 'COMPLETED',
          date_create: { gte: startDate, lte: endDate },
        },
      }),

      // Cancelled events
      prisma.event.count({
        where: {
          status: 'CANCELLED',
          date_create: { gte: startDate, lte: endDate },
        },
      }),

      // Total services
      prisma.service.count({
        where: { is_active: true },
      }),

      // Total rooms
      prisma.room.count({
        where: { is_active: true },
      }),
    ]);

    return createValidationResult(true, [], {
      totalUsers,
      totalEvents,
      totalRevenue: totalRevenue._sum.final_cost || 0,
      activeEvents,
      completedEvents,
      cancelledEvents,
      totalServices,
      totalRooms,
      period,
    });
  } catch (error) {
    return handleError('getOverviewStats', error);
  }
};

// ===== Revenue Analytics =====

/**
 * Get system revenue grouped by month (for a year) or by day (for a month).
 * @param {Object} params - { year?: number, month?: number }
 * @returns {Promise<{ isValid: boolean, data: Array<{ label: string, revenue: number }> }>}
 */
export const getRevenueAnalytics = async (params = {}) => {
  try {
    const now = new Date();
    let { year, month } = params;
    let startDate, endDate, groupBy;

    if (!year && !month) {
      year = now.getFullYear();
    }

    if (year && !month) {
      startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      // Set endDate to Dec 31, 23:59:59.999 of the same year
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      groupBy = 'month';
    } else if (year && month) {
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      // Set endDate to last day of the month, 23:59:59.999
      const lastDay = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
      groupBy = 'day';
    } else {
      year = now.getFullYear();
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
      groupBy = 'day';
    }

    // Only count events not PENDING or CANCELLED
    const validStatuses = [
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'RESCHEDULED',
    ];

    // Get all events in range with valid status
    const events = await prisma.event.findMany({
      where: {
        date_create: { gte: startDate, lt: endDate },
        status: { in: validStatuses },
      },
      select: { final_cost: true, estimated_cost: true, date_create: true },
    });

    let data = [];
    if (groupBy === 'month') {
      // Group by month
      const monthMap = {};
      for (const ev of events) {
        const m = new Date(ev.date_create).getMonth() + 1;
        monthMap[m] = (monthMap[m] || 0) + Number(ev.estimated_cost || 0);
      }
      for (let m = 1; m <= 12; m++) {
        data.push({ label: `${m}`, revenue: monthMap[m] || 0 });
      }
    } else {
      // Group by day
      const daysInMonth = new Date(year, month, 0).getDate();
      const dayMap = {};
      for (const ev of events) {
        const d = new Date(ev.date_create).getDate();
        dayMap[d] = (dayMap[d] || 0) + Number(ev.estimated_cost || 0);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        data.push({ label: `${d}`, revenue: dayMap[d] || 0 });
      }
    }

    return createValidationResult(true, [], data);
  } catch (error) {
    return handleError('getRevenueAnalytics', error);
  }
};

// ===== Event Analytics =====
export const getEventAnalytics = async (period = '30d') => {
  try {
    const { startDate, endDate } = getDateRange(period);

    // Events by status
    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      where: {
        date_create: { gte: startDate, lte: endDate },
      },
      _count: { status: true },
    });

    // Events by type
    const eventsByType = await prisma.eventType.findMany({
      select: {
        type_name: true,
        _count: {
          select: {
            events: {
              where: {
                date_create: { gte: startDate, lte: endDate },
              },
            },
          },
        },
      },
    });

    // Events trend (daily)
    const events = await prisma.event.findMany({
      where: {
        date_create: { gte: startDate, lte: endDate },
      },
      select: { status: true, date_create: true },
    });
    const trendMap = {};
    for (const ev of events) {
      const d = new Date(ev.date_create).toISOString().slice(0, 10);
      if (!trendMap[d])
        trendMap[d] = {
          events_count: 0,
          completed_count: 0,
          cancelled_count: 0,
        };
      trendMap[d].events_count += 1;
      if (ev.status === 'COMPLETED') trendMap[d].completed_count += 1;
      if (ev.status === 'CANCELLED') trendMap[d].cancelled_count += 1;
    }
    const eventsTrend = Object.entries(trendMap)
      .map(([date, val]) => ({
        date,
        ...val,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Average event duration
    const durationEvents = await prisma.event.findMany({
      where: {
        date_create: { gte: startDate, lte: endDate },
        start_time: { not: null },
        end_time: { not: null },
      },
      select: { start_time: true, end_time: true },
    });
    let avgEventDuration = 0;
    if (durationEvents.length > 0) {
      const total = durationEvents.reduce((sum, ev) => {
        const diff =
          (new Date(ev.end_time) - new Date(ev.start_time)) / 3600000;
        return sum + diff;
      }, 0);
      avgEventDuration = total / durationEvents.length;
    }

    return createValidationResult(true, [], {
      eventsByStatus,
      eventsByType: eventsByType.map((type) => ({
        type_name: type.type_name,
        events_count: type._count.events,
      })),
      eventsTrend,
      avgEventDuration: avgEventDuration[0]?.avg_duration_hours || 0,
      period,
    });
  } catch (error) {
    return handleError('getEventAnalytics', error);
  }
};

// ===== User Analytics =====
export const getUserAnalytics = async (period = '30d') => {
  try {
    const { startDate, endDate } = getDateRange(period);

    // New users trend
    const users = await prisma.account.findMany({
      where: {
        date_create: { gte: startDate, lte: endDate },
        is_active: true,
      },
      select: { date_create: true },
    });
    const usersTrendMap = {};
    for (const u of users) {
      const d = new Date(u.date_create).toISOString().slice(0, 10);
      usersTrendMap[d] = (usersTrendMap[d] || 0) + 1;
    }
    const usersTrend = Object.entries(usersTrendMap)
      .map(([date, new_users]) => ({ date, new_users }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Users by role
    const usersByRole = await prisma.account.groupBy({
      by: ['role'],
      where: {
        is_active: true,
      },
      _count: { role: true },
    });

    // Top customers by events
    const topCustomers = await prisma.account.findMany({
      where: {
        role: 'CUSTOMER',
        is_active: true,
        events: {
          some: {
            date_create: { gte: startDate, lte: endDate },
          },
        },
      },
      select: {
        account_id: true,
        account_name: true,
        email: true,
        _count: {
          select: {
            events: {
              where: {
                date_create: { gte: startDate, lte: endDate },
              },
            },
          },
        },
        events: {
          where: {
            date_create: { gte: startDate, lte: endDate },
            status: 'COMPLETED',
          },
          select: {
            final_cost: true,
          },
        },
      },
      orderBy: {
        events: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const processedTopCustomers = topCustomers.map((customer) => ({
      account_id: customer.account_id,
      account_name: customer.account_name,
      email: customer.email,
      events_count: customer._count.events,
      total_spent: customer.events.reduce(
        (sum, event) => sum + (event.final_cost || 0),
        0
      ),
    }));

    return createValidationResult(true, [], {
      usersTrend,
      usersByRole,
      topCustomers: processedTopCustomers,
      period,
    });
  } catch (error) {
    return handleError('getUserAnalytics', error);
  }
};

// ===== Service Analytics =====
export const getServiceAnalytics = async (period = '30d') => {
  try {
    const { startDate, endDate } = getDateRange(period);

    // Most popular services
    const popularServices = await prisma.service.findMany({
      select: {
        service_id: true,
        service_name: true,
        _count: {
          select: {
            event_services: {
              where: {
                event: {
                  date_create: { gte: startDate, lte: endDate },
                },
              },
            },
          },
        },
        event_services: {
          where: {
            event: {
              date_create: { gte: startDate, lte: endDate },
            },
          },
          select: {
            quantity: true,
            custom_price: true,
            variation: {
              select: { base_price: true },
            },
          },
        },
      },
      orderBy: {
        event_services: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const processedPopularServices = popularServices
      .map((service) => ({
        service_name: service.service_name,
        bookings_count: service._count.event_services,
        total_quantity: service.event_services.reduce(
          (sum, es) => sum + es.quantity,
          0
        ),
        total_revenue: service.event_services.reduce((sum, es) => {
          const price = es.custom_price || es.variation?.price || 0;
          return sum + price * es.quantity;
        }, 0),
      }))
      .filter((service) => service.bookings_count > 0);

    // Service utilization by type
    const servicesByType = await prisma.serviceType.findMany({
      select: {
        type_name: true,
        services: {
          select: {
            _count: {
              select: {
                event_services: {
                  where: {
                    event: {
                      date_create: { gte: startDate, lte: endDate },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const processedServicesByType = servicesByType
      .map((type) => ({
        type_name: type.type_name,
        bookings_count: type.services.reduce(
          (sum, service) => sum + service._count.event_services,
          0
        ),
      }))
      .filter((type) => type.bookings_count > 0);

    return createValidationResult(true, [], {
      popularServices: processedPopularServices,
      servicesByType: processedServicesByType,
      period,
    });
  } catch (error) {
    return handleError('getServiceAnalytics', error);
  }
};

// ===== Room Analytics =====
export const getRoomAnalytics = async (period = '30d') => {
  try {
    const { startDate, endDate } = getDateRange(period);

    // Room utilization
    const roomUtilization = await prisma.room.findMany({
      select: {
        room_id: true,
        room_name: true,
        capacity: true,
        _count: {
          select: {
            events: {
              where: {
                date_create: { gte: startDate, lte: endDate },
              },
            },
          },
        },
        events: {
          where: {
            date_create: { gte: startDate, lte: endDate },
            status: 'COMPLETED',
          },
          select: {
            final_cost: true,
            start_time: true,
            end_time: true,
          },
        },
      },
      orderBy: {
        events: {
          _count: 'desc',
        },
      },
    });

    const processedRoomUtilization = roomUtilization.map((room) => {
      const totalHours = room.events.reduce((sum, event) => {
        if (event.start_time && event.end_time) {
          const duration =
            (new Date(event.end_time) - new Date(event.start_time)) /
            (1000 * 60 * 60);
          return sum + duration;
        }
        return sum;
      }, 0);

      return {
        room_name: room.room_name,
        capacity: room.capacity,
        bookings_count: room._count.events,
        total_hours: Math.round(totalHours * 100) / 100,
        total_revenue: room.events.reduce(
          (sum, event) => sum + (event.final_cost || 0),
          0
        ),
      };
    });

    return createValidationResult(true, [], {
      roomUtilization: processedRoomUtilization,
      period,
    });
  } catch (error) {
    return handleError('getRoomAnalytics', error);
  }
};
