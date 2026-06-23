const db = require("../../config/db");

const checkConflicts = (meeting_date, participants) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        m.id,
        m.meeting_time,
        m.end_time,
        ma.user_id
      FROM meetings m
      JOIN meeting_attendees ma
        ON m.id = ma.meeting_id
      WHERE
        m.meeting_date = ?
        AND ma.user_id IN (?)
    `;

    db.query(
      sql,
      [meeting_date, participants],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const getAttendeeIds = (meetingId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT user_id FROM meeting_attendees WHERE meeting_id = ?",
      [meetingId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.map((r) => r.user_id));
      }
    );
  });
};

const createMeeting = (
  title,
  attendees,
  description,
  meeting_date,
  meeting_time,
  end_time,
  created_by
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO meetings
      (
        title,
        attendees,
        description,
        meeting_date,
        meeting_time,
        end_time,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        title,
        attendees,
        description,
        meeting_date,
        meeting_time,
        end_time,
        created_by,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const createMeetingAttendee = (
  meetingId,
  userId,
  status
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO meeting_attendees
      (
        meeting_id,
        user_id,
        status
      )
      VALUES (?, ?, ?)
      `,
      [meetingId, userId, status],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const getMeetingsByUserId = (
  userId
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        m.*,
        ma.status AS attendee_status
      FROM meetings m
      JOIN meeting_attendees ma
        ON m.id = ma.meeting_id
      WHERE ma.user_id = ?
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, email FROM users",
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const cancelMeeting = (
  meetingId
) => {
  return new Promise(
    (resolve, reject) => {
      db.query(
        "UPDATE meetings SET status = 'cancelled' WHERE id = ?",
        [meetingId],
        (err, result) => {
          if (err)
            return reject(err);

          resolve(result);
        }
      );
    }
  );
};

// const deleteMeeting = (meetingId) => {
//   return new Promise((resolve, reject) => {
//     db.query(
//       "DELETE FROM meetings WHERE id = ?",
//       [meetingId],
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       }
//     );
//   });
// };

const updateMeeting = (
  id,
  title,
  description,
  meeting_date,
  meeting_time,
  end_time
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      UPDATE meetings
      SET
        title = ?,
        description = ?,
        meeting_date = ?,
        meeting_time = ?,
        end_time = ?
      WHERE id = ?
      `,
      [title, description, meeting_date, meeting_time, end_time, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const getMeetingsForAvailability = (
  userId,
  date
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        m.title,
        m.meeting_time,
        m.end_time
      FROM meetings m
      JOIN meeting_attendees ma
        ON m.id = ma.meeting_id
      WHERE
        ma.user_id = ?
        AND m.meeting_date = ?
    `;

    db.query(
      sql,
      [userId, date],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const getInvitations = (
  userId
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        m.*,
        ma.status
      FROM meetings m
      JOIN meeting_attendees ma
        ON m.id = ma.meeting_id
      WHERE
        ma.user_id = ?
        AND ma.status = 'pending'
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const acceptInvitation = (
  meetingId,
  userId
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE meeting_attendees
      SET status = 'accepted'
      WHERE
        meeting_id = ?
        AND user_id = ?
    `;

    db.query(
      sql,
      [meetingId, userId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const declineInvitation = (
  meetingId,
  userId
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE meeting_attendees
      SET status = 'declined'
      WHERE
        meeting_id = ?
        AND user_id = ?
    `;

    db.query(
      sql,
      [meetingId, userId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const searchUsers = (search) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        email
      FROM users
      WHERE
        name LIKE ?
        OR email LIKE ?
    `;

    db.query(
      sql,
      [
        `%${search}%`,
        `%${search}%`,
      ],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const getMeetingParticipants = (
  meetingId
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        ma.status,
        m.created_by
      FROM meeting_attendees ma
      JOIN users u
        ON u.id = ma.user_id
      JOIN meetings m
        ON m.id = ma.meeting_id
      WHERE ma.meeting_id = ?
    `;

    db.query(
      sql,
      [meetingId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

module.exports = {
  checkConflicts,
  createMeeting,
  createMeetingAttendee,
  getMeetingsByUserId,
  getUsers,
  cancelMeeting,
  // deleteMeeting,
  updateMeeting,
  getMeetingsForAvailability,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  searchUsers,
  getMeetingParticipants,
  getAttendeeIds,
};