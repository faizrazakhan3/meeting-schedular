import { useState } from "react";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

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

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const emptyDays = Array.from(
    { length: firstDay },
    (_, i) => i
  );

  const dates = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  return (
    <div
      className="
        w-full

        bg-white/60
        backdrop-blur-xl

        border
        border-gray-200

        rounded-3xl

        shadow-xl

        p-6
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <button
          onClick={previousMonth}
          className="
            w-10
            h-10

            rounded-full

            bg-white

            shadow-md

            hover:shadow-lg

            transition
          "
        >
          ←
        </button>

        <h2 className="text-3xl font-bold">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="
            w-10
            h-10

            rounded-full

            bg-white

            shadow-md

            hover:shadow-lg

            transition
          "
        >
          →
        </button>

      </div>

      {/* Days */}
      <div className="grid grid-cols-7">

        {days.map((day) => (
          <div
            key={day}
            className="
              text-center
              font-semibold

              py-3

              border
              border-gray-200

              bg-gray-50
            "
          >
            {day}
          </div>
        ))}

      </div>

      {/* Dates */}
      <div className="grid grid-cols-7">

        {emptyDays.map((_, index) => (
          <div
            key={`empty-${index}`}
            className="
              h-24

              border
              border-gray-200

              bg-gray-50
            "
          />
        ))}

        {dates.map((date) => (
          <div
            key={date}
            className="
              h-24

              border
              border-gray-200

              p-2

              bg-white/40

              hover:bg-blue-50

              transition
              cursor-pointer
            "
          >
            <div className="flex justify-end">

              <span
                className="
                  font-semibold
                  text-gray-700
                "
              >
                {date}
              </span>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Calendar;