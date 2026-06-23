const db = require("../../config/db");


//  Save a new notification for a user.

const createNotification = (userId, type, meetingId, message) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO notifications (user_id, type, meeting_id, message) VALUES (?, ?, ?, ?)",
      [userId, type, meetingId, message],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};


//  Get ALL notifications for a user (newest first).
const getNotifications = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};


const markAllRead = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [userId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * Check if a reminder already exists (to avoid duplicates from the cron job).
 */
const reminderExists = (userId, meetingId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id FROM notifications WHERE user_id = ? AND meeting_id = ? AND type = 'reminder'",
      [userId, meetingId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      }
    );
  });
};

module.exports = {
  createNotification,
  getNotifications,
  markAllRead,
  reminderExists,
};
