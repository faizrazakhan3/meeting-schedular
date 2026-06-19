
const MeetingModel = require("./meeting.model");
const { createNotification } = require("../notifications/notification.model");

const createMeetingService = (
  meetingData,
  created_by
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        title,
        attendees,
        selectedUsers,
        description,
        meeting_date,
        meeting_time,
        end_time,
      } = meetingData;

      const participants = [
        created_by,
        ...(selectedUsers || []).map(
          (user) => user.id
        ),
      ];

      const now = new Date();

      const meetingDateTime = new Date(
        `${meeting_date}T${meeting_time}`
      );

      if (meetingDateTime < now) {
        return reject({
          status: 400,
          message:
            "Cannot create meetings in the past.",
        });
      }

      const existingMeetings =
        await MeetingModel.checkConflicts(
          meeting_date,
          participants
        );

      const hasConflict =
        existingMeetings.some(
          (meeting) =>
            meeting_time <
              meeting.end_time &&
            end_time >
              meeting.meeting_time
        );

      if (hasConflict) {
        return reject({
          status: 409,
          message:
            "One or more participants already have a meeting during this time.",
        });
      }

      const result =
        await MeetingModel.createMeeting(
          title,
          attendees,
          description,
          meeting_date,
          meeting_time,
          end_time,
          created_by
        );

      const meetingId =
        result.insertId;

      for (const userId of participants) {
        const status =
          userId === created_by
            ? "accepted"
            : "pending";

        await MeetingModel.createMeetingAttendee(
          meetingId,
          userId,
          status
        );

        // Save invite notification for every invited user (not the organizer)
        if (userId !== created_by) {
          await createNotification(
            userId,
            "invite",
            meetingId,
            `📩 You have been invited in meeting discussuion "${title}" on ${meeting_date} at ${meeting_time}`
          );
        } else {
          // Send notification to the organizer that they successfully scheduled the meeting
          await createNotification(
            created_by,
            "invite",
            meetingId,
            `📅 You scheduled a new meeting "${title}" on ${meeting_date} at ${meeting_time}`
          );
        }
      }

      resolve({
        message:
          "Meeting Created Successfully",
        id: meetingId,
      });
    } catch (err) {
      reject({
        status: 500,
        message:
          err.message ===
          "Conflict check failed"
            ? "Conflict check failed"
            : "Failed to create meeting",
        error: err,
      });
    }
  });
};

const getMeetingsService = (
  userId
) => {
  return MeetingModel.getMeetingsByUserId(
    userId
  ).catch(() => {
    throw {
      status: 500,
      message:
        "Failed to fetch meetings",
    };
  });
};

const getUsersService = () => {
  return MeetingModel.getUsers().catch(
    (err) => {
      throw {
        status: 500,
        error: err,
      };
    }
  );
};

const deleteMeetingService = (
  id
) => {
  return new Promise(async (
    resolve,
    reject
  ) => {
    try {
      await MeetingModel.deleteMeetingAttendees(
        id
      );

      await MeetingModel.deleteMeeting(id);

      resolve({
        message:
          "Meeting deleted successfully",
      });
    } catch (err) {
      reject({
        status: 500,
        message:
          err.message,
        error:
          err.message,
      });
    }
  });
};

const updateMeetingService = (
  id,
  title,
  description
) => {
  return MeetingModel.updateMeeting(
    id,
    title,
    description
  )
    .then(() => ({
      message:
        "Meeting updated successfully",
    }))
    .catch((err) => {
      throw {
        status: 500,
        message:
          "Failed to update meeting",
        error:
          err.message,
      };
    });
};

const checkAvailabilityService = (
  userId,
  date,
  time
) => {
  return new Promise(async (
    resolve,
    reject
  ) => {
    try {
      const meetings =
        await MeetingModel.getMeetingsForAvailability(
          userId,
          date
        );

      const busyMeeting =
        meetings.find(
          (meeting) =>
            time >=
              meeting.meeting_time &&
            time <
              meeting.end_time
        );

      if (busyMeeting) {
        return resolve({
          status: "busy",
          meeting:
            busyMeeting.title,
        });
      }

      resolve({
        status: "free",
      });
    } catch (err) {
      reject({
        status: 500,
        message:
          "Failed to check availability",
        error: err,
      });
    }
  });
};

const getInvitationsService = (
  userId
) => {
  return MeetingModel.getInvitations(
    userId
  ).catch(() => {
    throw {
      status: 500,
      message:
        "Failed to fetch invitations",
    };
  });
};

const acceptInvitationService = (
  meetingId,
  userId
) => {
  return MeetingModel.acceptInvitation(
    meetingId,
    userId
  )
    .then(() => ({
      message:
        "Invitation accepted",
    }))
    .catch(() => {
      throw {
        status: 500,
        message:
          "Failed to accept invitation",
      };
    });
};

const declineInvitationService = (
  meetingId,
  userId
) => {
  return MeetingModel.declineInvitation(
    meetingId,
    userId
  )
    .then(() => ({
      message:
        "Invitation declined",
    }))
    .catch(() => {
      throw {
        status: 500,
        message:
          "Failed to decline invitation",
      };
    });
};

const searchUsersService = (
  search
) => {
  return MeetingModel.searchUsers(
    search
  ).catch(() => {
    throw {
      status: 500,
      message:
        "Failed to search users",
    };
  });
};

const getMeetingParticipantsService =
  (meetingId) => {
    return MeetingModel.getMeetingParticipants(
      meetingId
    ).catch(() => {
      throw {
        status: 500,
        message:
          "Failed to fetch participants",
      };
    });
  };

module.exports = {
  createMeetingService,
  getMeetingsService,
  getUsersService,
  deleteMeetingService,
  updateMeetingService,
  checkAvailabilityService,
  getInvitationsService,
  acceptInvitationService,
  declineInvitationService,
  searchUsersService,
  getMeetingParticipantsService,
};