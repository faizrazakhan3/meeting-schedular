const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed:", err);
  } else {
    console.log("Database Connected Successfully");

    // Auto-create notifications table if it doesn't exist
    db.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        type       VARCHAR(50) NOT NULL,
        meeting_id INT NOT NULL,
        message    TEXT NOT NULL,
        is_read    TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )`,
      (tableErr) => {
        if (tableErr) {
          console.error("Failed to create notifications table:", tableErr);
        } else {
          console.log("Notifications table ready.");
        }
      }
    );
  }
});

module.exports = db;