-- Run this SQL once in your database to create the notifications table

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(50) NOT NULL,        -- 'invite' or 'reminder'
  meeting_id INT NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT DEFAULT 0,           -- 0 = unread, 1 = read
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id)
);
