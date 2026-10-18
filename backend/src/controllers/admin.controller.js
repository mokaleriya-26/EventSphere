import {
  getAdminStats,
  listAllUsers,
  toggleUserStatus,
  listAllEventsAdmin,
  moderateEventStatus
} from '../services/admin.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({
      success: true,
      stats,
      users: stats.users,
      events: stats.events,
      registrations: stats.bookings,
      recentEvents: stats.recentEvents,
      recentRegistrations: stats.recentRegistrations
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await listAllUsers(req.query);
    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await toggleUserStatus(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      user,
      message: `User status changed to ${user.status}.`
    });
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await listAllEventsAdmin(req.query);
    res.status(200).json({
      success: true,
      events
    });
  } catch (err) {
    next(err);
  }
};

export const moderateEvent = async (req, res, next) => {
  try {
    const event = await moderateEventStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      event,
      message: `Event status updated to ${req.body.status}.`
    });
  } catch (err) {
    next(err);
  }
};
