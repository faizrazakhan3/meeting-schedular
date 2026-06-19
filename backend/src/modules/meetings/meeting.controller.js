const {
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
} = require("./meeting.service");

const createMeeting = async (
  req,
  res
) => {
  try {
    const result =
      await createMeetingService(
        req.body,
        req.user.id
      );

    res.status(201).json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        message: error.message,
        error: error.error,
      });
  }
};

const getMeetings = async (
  req,
  res
) => {
  try {
    const result =
      await getMeetingsService(
        req.user.id
      );

    res.json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        message: error.message,
      });
  }
};

const getUsers = async (
  req,
  res
) => {
  try {
    const result =
      await getUsersService();

    res.json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json(error.error);
  }
};

const deleteMeeting = async (
  req,
  res
) => {
  try {
    const result =
      await deleteMeetingService(
        req.params.id
      );

    res.json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        message: error.message,
        error: error.error,
      });
  }
};

const updateMeeting = async (
  req,
  res
) => {
  try {
    const { title, description } =
      req.body;

    const result =
      await updateMeetingService(
        req.params.id,
        title,
        description
      );

    res.json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        message: error.message,
        error: error.error,
      });
  }
};

const checkAvailabilty =
  async (req, res) => {
    try {
      const {
        userId,
        date,
        time,
      } = req.query;

      const result =
        await checkAvailabilityService(
          userId,
          date,
          time
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
          error:
            error.error,
        });
    }
  };

const getInvitations =
  async (req, res) => {
    try {
      const result =
        await getInvitationsService(
          req.user.id
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
        });
    }
  };

const acceptInvitation =
  async (req, res) => {
    try {
      const result =
        await acceptInvitationService(
          req.params.meetingId,
          req.user.id
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
        });
    }
  };

const declineInvitation =
  async (req, res) => {
    try {
      const result =
        await declineInvitationService(
          req.params.meetingId,
          req.user.id
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
        });
    }
  };

const searchUsers =
  async (req, res) => {
    try {
      const result =
        await searchUsersService(
          req.query.search
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
        });
    }
  };

const getMeetingParticipants =
  async (req, res) => {
    try {
      const result =
        await getMeetingParticipantsService(
          req.params.meetingId
        );

      res.json(result);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          message:
            error.message,
        });
    }
  };

module.exports = {
  createMeeting,
  getMeetings,
  getUsers,
  deleteMeeting,
  updateMeeting,
  checkAvailabilty,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  searchUsers,
  getMeetingParticipants,
};