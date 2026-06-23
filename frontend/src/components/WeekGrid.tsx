import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import toast from "react-hot-toast";

interface WeekGridProps {
  meetings: any[];

  onCellClick: (
    date: string,
    time: string
  ) => void;

  onMeetingClick: (
    meeting: any
  ) => void;
}

function WeekGrid({
  meetings,
  onCellClick,
  onMeetingClick,
}: WeekGridProps) {
  const events = meetings
    .filter(
      (meeting: any) =>
        meeting.meeting_date &&
        meeting.meeting_time &&
        meeting.end_time
    )
   .map((meeting: any) => {

  console.log(
    "Meeting:",
    meeting
  );

 const date =
  meeting.meeting_date
    .split("T")[0];

  return {
  id: meeting.id,
  title:
    meeting.status === "cancelled"
      ? `🚫 ${meeting.title}`
      : meeting.title,
  start: `${date}T${meeting.meeting_time}:00`,
  end: `${date}T${meeting.end_time}:00`,
  backgroundColor:
    meeting.status === "cancelled"
      ? "#8B7355"
      : undefined,
  borderColor:
    meeting.status === "cancelled"
      ? "#8B7355"
      : undefined,
  extendedProps: {
    meeting,
    meetingTime: meeting.meeting_time,
    endTime: meeting.end_time,
    description:
      meeting.description ||
      "No description",
  },
};
    });
  return (
    <FullCalendar
      plugins={[
        timeGridPlugin,
        interactionPlugin,
      ]}
      initialView="timeGridWeek"
      selectable={true}
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      height="80vh"
      events={events}
      eventClick={(info) => {
        onMeetingClick(
          info.event.extendedProps.meeting
        );
      }}
      eventDidMount={(info) => {
        info.el.title =
          `Title: ${info.event.title}\n` +
          `Time: ${info.event.extendedProps.meetingTime} - ${info.event.extendedProps.endTime}\n` +
          `Description: ${info.event.extendedProps.description}`;
      }}
     dateClick={(info) => {
  const now = new Date();

  if (info.date < now) {
    toast.error(
      "You cannot create meetings in the past."
    );
    return;
  }

  const date =
    info.dateStr.split("T")[0];

  const time =
    info.date
      .toTimeString()
      .slice(0, 5);

  onCellClick(date, time);
}}
    />
  );
}
export default WeekGrid;