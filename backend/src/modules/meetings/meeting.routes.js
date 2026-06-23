const express = require("express");

const {
    searchUsers,
    createMeeting,
    getMeetings,
    getUsers,
    getMeetingParticipants,
    // deleteMeeting,
    cancelMeeting,
    updateMeeting,
    getInvitations,
    acceptInvitation,
    declineInvitation,
    checkAvailabilty,
} = require("./meeting.controller");

const verifyToken = require(
  "../../middleware/auth.middleware"
);

const router = express.Router();

router.post(
    "/",
    verifyToken,
    createMeeting
);

router.get(
    "/",
    verifyToken,
    getMeetings
);

router.get(
    "/users",
    verifyToken,
    getUsers
);

router.patch(
    "/:id/cancel",
    verifyToken,
    cancelMeeting
);

// router.delete(
//     "/:id",
//     verifyToken,
//     deleteMeeting
// );

router.put(
    "/:id",
    verifyToken,
    updateMeeting
);

router.get(
    "/availability",
    verifyToken,
    checkAvailabilty
);

router.get(
    "/invitations",
    verifyToken,
    getInvitations
);

router.put(
    "/accept/:meetingId",
    verifyToken,
    acceptInvitation
);

router.get(
    "/:meetingId/participants",
    verifyToken,
    getMeetingParticipants
);

router.put(
    "/decline/:meetingId",
    verifyToken,
    declineInvitation
);

router.get(
    "/search-users",
    verifyToken,
    searchUsers
);

module.exports = router;