import { useState, useEffect } from "react";
import { styles } from "../theme/styles";
import toast from "react-hot-toast";

interface MeetingModalProps {
  date: string;
  time: string;
  fetchMeetings: () => void;
  onClose: () => void;
  selectedMeeting?: any;
}
interface ParticipantRowProps {
  user: any;
  color: string;
}

const ParticipantRow = ({
  user,
  color,
}: ParticipantRowProps) => (
  <div
    className="
      flex items-center gap-3
      px-3 py-2
      rounded-md
      border border-transparent
      hover:border-gray-400
      hover:bg-gray-50
      hover:shadow-sm
      transition-all duration-150
      cursor-pointer
    "
  >
    <div
      className={`
        h-8 w-8
        rounded-full
        flex items-center justify-center
        text-sm font-semibold
        ${color}
      `}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>

    <span className="text-sm text-gray-800">
      {user.name}
    </span>
  </div>
);

function MeetingModal({
  date,
  time,
  fetchMeetings,
  onClose,
  selectedMeeting,
}: MeetingModalProps) {

  const [participants, setParticipants] =
    useState<any[]>([]);
  const [title, setTitle] = useState(
    selectedMeeting?.title || ""
  );

  const [description, setDescription] =
    useState(
      selectedMeeting?.description || ""
    );


  const [selectedUsers, setSelectedUsers] =
    useState<any[]>([]);


  const [searchText, setSearchText] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<any[]>([]);


  const fetchParticipants =
    async (meetingId: number) => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `http://localhost:5000/api/meetings/${meetingId}/participants`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        setParticipants(data);

      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {

    if (selectedMeeting) {
      fetchParticipants(
        selectedMeeting.id
      );
    }

  }, [selectedMeeting]);
  const getEndTime = (
    startTime: string
  ) => {
    const dateObj = new Date(
      `2000-01-01T${startTime}`
    );

    dateObj.setMinutes(
      dateObj.getMinutes() + 30
    );

    return dateObj
      .toTimeString()
      .slice(0, 5);
  };

  const endTime =
    getEndTime(time);
  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        selectedMeeting
          ? `http://localhost:5000/api/meetings/${selectedMeeting.id}`
          : "http://localhost:5000/api/meetings",
        {
          method: selectedMeeting
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title,
            attendees: selectedUsers
              .map(
                (user) => user.email
              )
              .join(", "),

            selectedUsers,

            description,

            meeting_date: date,

            meeting_time: time,

            end_time: endTime,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      console.log(data);

      await fetchMeetings();

      toast.success(
        selectedMeeting
          ? "Meeting Updated Successfully"
          : "Meeting Created Successfully"
      );

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        selectedMeeting
          ? "Failed to update meeting"
          : "Failed to create meeting"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/meetings/${selectedMeeting.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      await fetchMeetings();

      toast.success("Meeting Deleted Successfully");
      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete meeting");
    }
  };

  const searchUsers = async (
    value: string
  ) => {
    setSearchText(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `http://localhost:5000/api/meetings/search-users?search=${value}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      setSearchResults(data);

    } catch (error) {
      console.error(error);
    }
  };
  const organizer =
    participants.find(
      (p) => p.id === p.created_by
    );

  const accepted =
    participants.filter(
      (p) =>
        p.status === "accepted" &&
        p.id !== p.created_by
    );
  const pending =
    participants.filter(
      (p) => p.status === "pending"
    );

  const declined =
    participants.filter(
      (p) => p.status === "declined"
    );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="
          bg-white
          w-full
          max-w-6xl
          max-h-[90vh]
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex
            justify-between
            items-center
            px-8
            py-5
            border-b
          "
        >
          <h2 className="text-2xl font-bold">
            {selectedMeeting
              ? "Edit Meeting"
              : "New Event"}
          </h2>

          <button
            onClick={onClose}
            className="
              text-3xl
              text-gray-500
              hover:text-black
            "
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 max-h-[70vh] overflow-y-auto">
          {/* Left Section */}
          <div className="lg:col-span-2 p-8">

            <div className="space-y-6">

              <input
                type="text"
                placeholder="Add title"
                className={
                  styles.meetingModel
                }
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

              {/* Selected Users */}
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(
                  (user: any) => (
                    <div
                      key={user.id}
                      className="
          flex
          items-center
          gap-2
          px-3
          py-1
          bg-blue-100
          text-blue-700
          rounded-full
          text-sm
        "
                    >
                      <span>
                        {user.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedUsers(
                            selectedUsers.filter(
                              (u) =>
                                u.id !== user.id
                            )
                          )
                        }
                        className="
            font-bold
            hover:text-red-600
          "
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Invite Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search attendees..."
                  className={styles.meetingModel}
                  value={searchText}
                  onChange={(e) =>
                    searchUsers(e.target.value)
                  }
                />

                {searchResults.length > 0 && (
                  <div
                    className="absolute z-50 top-full right-0 w-90 mt-1 bg-white border
        border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
                    {searchResults.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          const exists =
                            selectedUsers.some(
                              (selected) =>
                                selected.id === user.id
                            );

                          if (!exists) {
                            setSelectedUsers([
                              ...selectedUsers,
                              user,
                            ]);
                          }

                          setSearchText("");
                          setSearchResults([]);
                        }}
                        className="
            flex items-center gap-3
            px-3 py-2
            hover:bg-gray-50
            cursor-pointer
          "
                      >
                        <div
                          className="
              h-8 w-8
              rounded-full
              bg-blue-100
              text-blue-700
              flex items-center justify-center
              text-xs font-semibold
              shrink-0
            "
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {user.name}
                          </span>

                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Description"
                className={styles.meetingModel}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* Meeting Details */}
          {/* Meeting Details */}
          <div
            className="border-t lg:border-t-0 lg:border-l border-gray-200 bg-white p-6 min-w-[320px]">
            <h3 className="font-semibold text-xl mb-6">Meeting Details</h3>


            {!selectedMeeting ? (
              <div className="text-gray-500">
                Save the meeting to view participant status.
              </div>
            ) : (
              <div className="space-y-6">

                {/* Organizer */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                    Organizer
                  </div>

                  {organizer && (
                    <div
                      className="
              flex items-center gap-3
              px-3 py-2
              rounded-md
              border border-transparent
              hover:border-gray-300
              hover:bg-blue-50
              transition-all
              cursor-pointer
            "
                    >
                      <div
                        className="
                h-8 w-8
                rounded-full
                bg-blue-100
                text-blue-700
                flex items-center justify-center
                text-sm font-semibold
              "
                      >
                        {organizer.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="text-sm font-medium text-gray-800">
                        {organizer.name}
                      </span>
                    </div>
                  )}
                </div>
                <hr className="border-gray-200" />

                {/* Accepted */}
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Accepted ({accepted.length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {accepted.map((user) => (
                      <ParticipantRow
                        key={user.id}
                        user={user}
                        color="bg-green-100 text-green-700"
                      />
                    ))}
                  </div>
                </div>
                <hr className="border-gray-200" />

                {/* Pending */}
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Pending ({pending.length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {pending.map((user) => (
                      <ParticipantRow
                        key={user.id}
                        user={user}
                        color="bg-amber-100 text-amber-700"
                      />
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Declined */}
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Declined ({declined.length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {declined.map((user) => (
                      <ParticipantRow
                        key={user.id}
                        user={user}
                        color="bg-red-100 text-green-700"
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div
          className="flex justify-end gap-4 px-8 py-5 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 border rounded-xl">
            Cancel
          </button>
          <div className="flex gap-3"> {selectedMeeting && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Delete
            </button>
          )}

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              {selectedMeeting
                ? "Update"
                : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingModal;