import { useEffect, useState } from "react";
import MainLayout from "../layout/Mainlayout";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const[invitations, setInvitations]=
  useState<any[]>([]);

  const [meetings, setMeetings] =
    useState<any[]>([]);

  useEffect(() => {
    fetchMeetings();
    fetchInvitations();
  }, []);


  const fetchInvitations =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          "http://localhost:5000/api/meetings/invitations",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      setInvitations(data);

    } catch (error) {
      console.error(error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/meetings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      setMeetings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const initials =
    user.name
      ?.split(" ")
      .map(
        (word: string) => word[0]
      )
      .join("")
      .toUpperCase() || "U";


      const acceptInvitation =
  async (meetingId: number) => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `http://localhost:5000/api/meetings/accept/${meetingId}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      fetchInvitations();
      fetchMeetings();

    } catch (error) {
      console.error(error);
    }
  };

  const declineInvitation =
  async (meetingId: number) => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `http://localhost:5000/api/meetings/decline/${meetingId}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      fetchInvitations();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div
        className="
          w-full
          space-y-8
        "
      >
        {/* Page Heading */}

        <div>
          <h1
            className="
              text-4xl
              font-bold
              text-[#2D2D2D]
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-2
              text-[#8B8B8B]
            "
          >
            Overview of your meetings and activity
          </p>
        </div>

        {/* Stats */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >
          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#ECE8E1]
              shadow-sm
              p-6
            "
          >
            <p
              className="
                text-sm
                text-[#8B8B8B]
              "
            >
              Total Meetings
            </p>

            <h2
              className="
                text-4xl
                font-bold
                mt-3
                text-[#2D2D2D]
              "
            >
              {meetings.length}
            </h2>
          </div>

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#ECE8E1]
              shadow-sm
              p-6
            "
          >
            <p
              className="
                text-sm
                text-[#8B8B8B]
              "
            >
              Account Status
            </p>

            <h2
              className="
                text-2xl
                font-semibold
                mt-3
                text-[#2D2D2D]
              "
            >
              Active
            </h2>
          </div>

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#ECE8E1]
              shadow-sm
              p-6
            "
          >
            <p
              className="
                text-sm
                text-[#8B8B8B]
              "
            >
              User Initials
            </p>

            <h2
              className="
                text-2xl
                font-semibold
                mt-3
                text-[#2D2D2D]
              "
            >
              {initials}
            </h2>
          </div>
        </div>


        {invitations.length > 0 && (
  <div
    className="
      bg-white
      rounded-3xl
      border
      border-[#ECE8E1]
      shadow-sm
      p-8
    "
  >
    <div className="mb-6">
      <h2
        className="
          text-3xl
          font-bold
          text-[#2D2D2D]
        "
      >
        Pending Invitations
      </h2>

      <p
        className="
          text-[#8B8B8B]
          mt-1
        "
      >
        Meetings waiting for your response
      </p>
    </div>

            <div className="space-y-4">
              {invitations.map(
                (invite) => (
                  <div
                    key={invite.id}
                    className="
                      bg-[#FCFBF9]
                      border
                      border-[#ECE8E1]
                      rounded-2xl
                      p-6
                    "
                  >
                    <h3
                      className="
                        text-xl
                        font-semibold
                        text-[#2D2D2D]
                      "
                    >
                      {invite.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[#8B8B8B]
                      "
                    >
                      📅 {invite.meeting_date}
                      {" • "}
                      ⏰ {invite.meeting_time}
                    </p>

                    <p
                      className="
                        mt-4
                        text-[#5F5F5F]
                      "
                    >
                      {invite.description}
                    </p>

                    <div
                      className="
                        flex
                        gap-3
                        mt-5
                      "
                    >
                      <button
                      onClick={() =>
                        acceptInvitation(invite.id)
                      }
                      className="
                        px-4
                        py-2
                        rounded-xl
                        bg-green-600
                        text-white
                      "
                    >
                      Accept
                    </button>

                      <button
                      onClick={() =>
                        declineInvitation(invite.id)
                      }
                      className="
                        px-4
                        py-2
                        rounded-xl
                        bg-red-600
                        text-white
                      "
                    >
                      Decline
                    </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {/* Meetings Section */}

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-[#ECE8E1]
            shadow-sm
            p-8
          "
        >
         <div
  className="
    flex
    flex-col
    md:flex-row
    md:items-center
    md:justify-between
    gap-4
    mb-8
  "
>
            <div>
              <h2
                className="
                  text-3xl
                  font-bold
                  text-[#2D2D2D]
                "
              >
                My Meetings
              </h2>

              <p
                className="
                  text-[#8B8B8B]
                  mt-1
                "
              >
                Manage and review all
                scheduled meetings
              </p>
            </div>

            <div
              className="
                px-4
                py-2
                rounded-2xl
                bg-[#F5F1EA]
                text-[#6B5D4D]
                font-medium
              "
            >
              {meetings.length} Meetings
            </div>
          </div>

          {meetings.length === 0 ? (
            <div
              className="
                text-center
                py-12
              "
            >
              <p
                className="
                  text-[#8B8B8B]
                "
              >
                No meetings found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map(
                (meeting) => (
                  <div
                    key={meeting.id}
                    className="
                      bg-[#FCFBF9]
                      border
                      border-[#ECE8E1]
                      rounded-2xl
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-md
                    "
                  >
                    <div
                      className="
                        flex
                        justify-between
                        items-start
                        gap-4
                      "
                    >
                      <div>
                        <h3
                          className="
                            text-xl
                            font-semibold
                            text-[#2D2D2D]
                          "
                        >
                          {meeting.title}
                        </h3>

                        <p
                          className="
                            mt-2
                            text-[#8B8B8B]
                          "
                        >
                          📅 {meeting.meeting_day}
                          {" • "}
                          ⏰ {meeting.meeting_time}
                        </p>
                      </div>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-xl
                        text-sm
                        font-medium
                        ${
                          meeting.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : meeting.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {meeting.status === "accepted"
                        ? "✓ Accepted"
                        : meeting.status === "pending"
                        ? "Pending"
                        : "Declined"}
                    </span>
                    </div>

                    <div
                      className="
                        h-px
                        bg-[#ECE8E1]
                        my-4
                      "
                    />

                    <p
                      className="
                        text-[#5F5F5F]
                        leading-relaxed
                      "
                    >
                      {meeting.description}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;