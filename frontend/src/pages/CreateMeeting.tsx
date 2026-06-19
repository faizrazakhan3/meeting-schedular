import {
  useState,
  useEffect,
} from "react";

import MainLayout from "../layout/Mainlayout";
import WeekGrid from "../components/WeekGrid";
import MeetingModal from "../components/MeetingModal";

function CreateMeeting() {

  const [showModal, setShowModal] =
    useState(false);

  const [meetings, setMeetings] =
    useState([]);

  const [selectedDate, setSelectedDate] =
  useState("");

const [selectedTime, setSelectedTime] =
  useState("");

  const [currentDate, setCurrentDate] =
    useState(new Date());


  const [selectedMeeting, setselectedMeeting]=
  useState<any>(null);


  const fetchMeetings = async () => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/meetings",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    setMeetings(data);
    console.log(meetings,data);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchMeetings();
  }, []);

  const previousWeek = () => {
    const newDate = new Date(currentDate);

    newDate.setDate(
      currentDate.getDate() - 7
    );

    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);

    newDate.setDate(
      currentDate.getDate() + 7
    );

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekRange = () => {
    const start = new Date(currentDate);

    start.setDate(
      currentDate.getDate() -
        currentDate.getDay() +
        1
    );

    const end = new Date(start);

    end.setDate(start.getDate() + 4);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${start.getDate()}-${end.getDate()} ${
      monthNames[end.getMonth()]
    }, ${end.getFullYear()}`;
  };

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        <div className="flex-1">

          <div
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              overflow-hidden
              shadow-sm
            "
          >
            {/* Toolbar */}
            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-4
                border-b
                border-gray-200
              "
            >
              <div className="flex items-center gap-4">

                <button
                  onClick={goToToday}
                  className="
                    px-4
                    py-2
                    border
                    border-gray-300
                    rounded-lg
                    hover:bg-gray-50
                  "
                >
                  Today
                </button>

                <button
                  onClick={previousWeek}
                  className="
                    text-xl
                    text-gray-600
                    hover:text-black
                  "
                >
                  ❮
                </button>

                <button
                  onClick={nextWeek}
                  className="
                    text-xl
                    text-gray-600
                    hover:text-black
                  "
                >
                  ❯
                </button>

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  {getWeekRange()}
                </h2>

              </div>
            </div>

        <WeekGrid
  meetings={meetings}
  onCellClick={(date, time) => {
    setselectedMeeting(null);
    setSelectedDate(date);
    setSelectedTime(time);
    setShowModal(true);
  }}
  onMeetingClick={(meeting) => {
    setselectedMeeting(meeting);
    setSelectedDate(
      meeting.meeting_date
    );
   setSelectedDate(
  meeting.meeting_date
    .split("T")[0]
);
    setShowModal(true);
  }}
/>

          </div>

        </div>

      </div>

     {showModal && (
  <MeetingModal
  date={selectedDate}
  time={selectedTime}
  selectedMeeting={
    selectedMeeting
  }
  fetchMeetings={fetchMeetings}
  onClose={() => {
    setShowModal(false);
    setselectedMeeting(null);
  }}
/>
)}
    </MainLayout>
  );
}

export default CreateMeeting;