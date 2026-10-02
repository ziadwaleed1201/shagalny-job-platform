const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// Reusable helper so other controllers can create notifications.
async function notify(userId, title, message, type = 'general') {
  if (!userId) return;
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (e) { /* never block the main action on a notification failure */ }
}

// GET /api/notifications -> my notifications (newest first)
const myNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  res.json(list);
});

// PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
});

// PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ ok: true });
});

module.exports = { myNotifications, markAllRead, markRead, notify };
