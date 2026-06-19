const cron = require("node-cron");
const db = require("../../config/db");
const { createNotification, reminderExists } = require("./notification.model");

// Initialize Cron Jobs
const initCronJobs = () => {
  // Check for upcoming meetings every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏰ Running Meeting Reminder Cron Job...");

      // Find all meetings starting within the next 15 minutes
      // Since meeting_time is formatted as HH:mm:ss, we check if the meeting is today
      // and meeting_time is between current time and 15 minutes from now.
      const sql = `
        SELECT m.id as meeting_id, m.title, m.meeting_date, m.meeting_time, ma.user_id
        FROM meetings m
        JOIN meeting_attendees ma ON m.id = ma.meeting_id
        WHERE m.meeting_date = CURDATE()
          AND m.meeting_time > CURTIME()
          AND m.meeting_time <= ADDTIME(CURTIME(), '00:15:00')
      `;

      db.query(sql, async (err, meetings) => {
        if (err) {
          console.error("Cron Error: Failed to fetch upcoming meetings", err);
          return;
        }

        for (const meeting of meetings) {
          const { user_id, meeting_id, title, meeting_time } = meeting;

          // Check if we already created a reminder notification for this user and meeting
          const alreadyReminded = await reminderExists(user_id, meeting_id);

          if (!alreadyReminded) {
            console.log(`Sending reminder to user ${user_id} for meeting ${meeting_id}`);
            await createNotification(
              user_id,
              "reminder",
              meeting_id,
              `🔔 Reminder: The meeting "${title}" starts soon at ${meeting_time}!`
            );
          }
        }
      });
    } catch (error) {
      console.error("Error in Meeting Reminder Cron job:", error);
    }
  });

  console.log("✅ Cron Jobs Registered successfully.");
};

module.exports = { initCronJobs };
