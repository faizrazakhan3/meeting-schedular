import { useState, useEffect, useCallback } from "react";
import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { viewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
// import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import toast from "react-hot-toast";
import "@schedule-x/theme-default/dist/index.css";

interface WeekGridProps {
  meetings: any[];
  onCellClick: (date: string, time: string) => void;
  onMeetingClick: (meeting: any) => void;
}
// ADAPTER LAYER

function mapMeetingToScheduleXEvent(meeting: any) {
  // 1. Safe Date Parsing
  let dateStr = "1970-01-01";
  if (meeting.meeting_date) {
    try {
      const d = new Date(meeting.meeting_date);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dateStr = `${yyyy}-${mm}-${dd}`;
      }
    } catch (e) {
    }
  }

  // 2. Safe Time Parsing (Guarantee HH:mm:ss format for ISO parsing)
  const formatTime = (timeInput: string, fallback: string) => {
    if (!timeInput) return fallback;
    const parts = timeInput.split(":");
    const h = (parts[0] || "00").padStart(2, '0');
    const m = (parts[1] || "00").substring(0, 2).padStart(2, '0');
    return `${h}:${m}:00`; 
  };

  const startTime = formatTime(meeting.meeting_time, "00:00:00");
  const endTime = formatTime(meeting.end_time, "00:30:00");

  // e.g., '2026-06-25T14:30:00[UTC]'
  const startTemporal = (globalThis as any).Temporal.ZonedDateTime.from(`${dateStr}T${startTime}[UTC]`);
  const endTemporal = (globalThis as any).Temporal.ZonedDateTime.from(`${dateStr}T${endTime}[UTC]`);

  return {
    id: String(meeting.id),
    title: meeting.status === "cancelled" ? `🚫 ${meeting.title}` : meeting.title,
    start: startTemporal,
    end: endTemporal,
    description: meeting.description || "No description",
    _rawMeeting: meeting,
    calendarId: meeting.status === "cancelled" ? 'cancelled' : 'scheduled',
  };
}

function WeekGrid({ meetings, onCellClick, onMeetingClick }: WeekGridProps) {
  const [eventsService] = useState(() => createEventsServicePlugin());
  // const [dragAndDrop] = useState(() => createDragAndDropPlugin());

  const handleEventClick = useCallback((calendarEvent: any) => {
    // We retrieve the original backend meeting object from our custom property
    if (calendarEvent._rawMeeting) {
      onMeetingClick(calendarEvent._rawMeeting);
    }
  }, [onMeetingClick]);

  const handleClickDateTime = useCallback((dateTime: any) => {
    // dateTime comes in as a Temporal.ZonedDateTime object in Schedule-X v4+
    const year = dateTime.year;
    const month = String(dateTime.month).padStart(2, '0');
    const day = String(dateTime.day).padStart(2, '0');
    const hour = String(dateTime.hour).padStart(2, '0');
    const minute = String(dateTime.minute).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hour}:${minute}`;

    const now = new Date();
    // Parse the clicked datetime string into a Date object for comparison
    const clickedDate = new Date(`${dateStr}T${timeStr}:00`);

    if (clickedDate < now) {
      toast.error("You cannot create meetings in the past.");
      return;
    }

    onCellClick(dateStr, timeStr);
  }, [onCellClick]);

  const handleEventUpdate = useCallback(async (updatedEvent: any) => {
    console.log("Event Updated (Drag/Resize):", updatedEvent);
  }, []);

  // 3. Initialize Calendar Application
  const calendarApp = useNextCalendarApp({
    views: [viewWeek],
    defaultView: viewWeek.name,
    events: [], // Initially empty, we will sync via useEffect
    plugins: [eventsService], // Plugins must be registered in the config object
    callbacks: {
      onEventClick: handleEventClick,
      onClickDateTime: handleClickDateTime,
      onEventUpdate: handleEventUpdate,
    },
    calendars: {
      scheduled: {
        colorName: 'scheduled',
        lightColors: { main: '#4f46e5', container: '#eef2ff', onContainer: '#312e81' },
        darkColors: { main: '#6366f1', container: '#3730a3', onContainer: '#e0e7ff' },
      },
      cancelled: {
        colorName: 'cancelled',
        lightColors: { main: '#64748b', container: '#f1f5f9', onContainer: '#334155' },
        darkColors: { main: '#94a3b8', container: '#334155', onContainer: '#f1f5f9' },
      }
    }
  });

  // 4. Sync React State (meetings) to Schedule-X State (eventsService)
  useEffect(() => {
    const validMeetings = meetings.filter(
      (m: any) => m.meeting_date && m.meeting_time && m.end_time
    );

    // Run the adapter
    const sxEvents = validMeetings.map(mapMeetingToScheduleXEvent);

    eventsService.set(sxEvents);
  }, [meetings, eventsService]);

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-4 flex flex-col sc " style={{ height: '80vh', overflow: 'hidden', }}>
      <div className="flex-1 overflow-auto hide-scrollbar">
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>
    </div>
  );
}

export default WeekGrid;