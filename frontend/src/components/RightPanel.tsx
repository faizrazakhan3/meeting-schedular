import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, Plus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type RMeeting = {
  id: number;
  title: string;
  meeting_date: string;
  meeting_time: string;
  attendees: string;
  status: string;
  attendee_status?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const ICON_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-purple-500",
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-rose-500",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAvatars(attendeesStr: string) {
  if (!attendeesStr) return [];
  return attendeesStr.split(",").map((email) => {
    const trimmed = email.trim();
    const parts = trimmed.split("@")[0].replace(/[^a-zA-Z]/g, ' ').split(' ').filter(Boolean);
    let initials = "";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0][0].toUpperCase();
    } else {
      initials = "U";
    }
    return { email: trimmed, initials };
  });
}

function formatMeetingDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return "";
  try {
    const datePart = dateStr.split("T")[0];
    const date = new Date(`${datePart}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let day = "";
    if (date.getTime() === today.getTime()) day = "Today";
    else if (date.getTime() === tomorrow.getTime()) day = "Tomorrow";
    else
      day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (!timeStr) return day;
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const dh = h % 12 === 0 ? 12 : h % 12;
    return `${day}, ${dh}:${m.toString().padStart(2, "0")} ${period}`;
  } catch {
    return dateStr;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

function RightPanel() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<RMeeting[]>([]);
  const [expandedMeetings, setExpandedMeetings] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch("https://localhost:5000/api/meetings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        setMeetings(await res.json());
      } catch {
        /* silent */
      }
    };
    loadMeetings();
  }, []);

  const now = new Date();
  const upcoming = meetings
    .filter((m) => {
      if (m.status === "cancelled" || !m.meeting_date) return false;
      if (m.attendee_status && m.attendee_status !== "accepted" && m.status !== "accepted") return false;
      const datePart = m.meeting_date.split("T")[0];
      const timePart = m.meeting_time || "00:00";
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      const dt = new Date(year, month - 1, day, hours, minutes);
      return dt > now;
    })
    .sort((a, b) => {
      const aDatePart = a.meeting_date.split("T")[0];
      const aTimePart = a.meeting_time || "00:00";
      const [aYear, aMonth, aDay] = aDatePart.split("-").map(Number);
      const [aHours, aMinutes] = aTimePart.split(":").map(Number);
      const aDt = new Date(aYear, aMonth - 1, aDay, aHours, aMinutes);

      const bDatePart = b.meeting_date.split("T")[0];
      const bTimePart = b.meeting_time || "00:00";
      const [bYear, bMonth, bDay] = bDatePart.split("-").map(Number);
      const [bHours, bMinutes] = bTimePart.split(":").map(Number);
      const bDt = new Date(bYear, bMonth - 1, bDay, bHours, bMinutes);

      return aDt.getTime() - bDt.getTime();
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-7 w-full">

      {/* ── Upcoming Meetings ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Upcoming Meetings</h3>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-2xl border border-slate-100">
              No upcoming meetings
            </p>
          )}

          {upcoming.map((m, i) => {
            const avatars = getAvatars(m.attendees);
            return (
              <div
                key={m.id}
                onClick={() => navigate(`/meeting/${m.id}`)}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex gap-3 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer group"
              >
                {/* Colored icon */}
                <div
                  className={`h-9 w-9 rounded-xl ${ICON_COLORS[i % ICON_COLORS.length]} flex items-center justify-center shrink-0`}
                >
                  <Calendar size={15} className="text-white" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                    {m.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                    {formatMeetingDateTime(m.meeting_date, m.meeting_time)}
                  </p>

                  {/* Stacked avatars */}
                  {avatars.length > 0 && (
                    <div className={`flex ${expandedMeetings[m.id] ? 'flex-wrap gap-1' : '-space-x-1.5'} mt-2 overflow-visible`}>
                      {(expandedMeetings[m.id] ? avatars : avatars.slice(0, 3)).map((av, j) => (
                        <div
                          key={j}
                          className={`h-5 w-5 rounded-full ring-2 ring-white flex items-center justify-center text-[7px] font-bold text-white shrink-0 ${AVATAR_COLORS[j % AVATAR_COLORS.length]}`}
                          title={av.email}
                        >
                          {av.initials}
                        </div>
                      ))}
                      {!expandedMeetings[m.id] && avatars.length > 3 && (
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedMeetings(prev => ({ ...prev, [m.id]: true }));
                          }}
                          className="h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500 shrink-0 cursor-pointer hover:bg-slate-300 transition-colors"
                        >
                          +{avatars.length - 3}
                        </div>
                      )}
                      {expandedMeetings[m.id] && avatars.length > 3 && (
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedMeetings(prev => ({ ...prev, [m.id]: false }));
                          }}
                          className="h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 cursor-pointer hover:bg-slate-300 transition-colors"
                          title="Show less"
                        >
                          -
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick Start ───────────────────────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Start</h3>
        <button
          onClick={() => navigate("/create-meeting")}
          className="w-full bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer group"
        >
          {/* Purple circle */}
          <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} className="text-white" />
          </div>

          {/* Label */}
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-slate-800">New Meeting</p>
            <p className="text-[10px] text-slate-400 font-semibold">Create a new meeting</p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={14}
            className="text-slate-400 shrink-0 group-hover:text-indigo-500 transition-colors"
          />
        </button>
      </section>
    </div>
  );
}

export default RightPanel;
