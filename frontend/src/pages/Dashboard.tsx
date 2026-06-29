import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/Mainlayout";
import {
  Calendar,
  Clock,
  CheckCircle2,
  // Mail,
  // Plus,
  // Video,
  // Inbox
} from "lucide-react";

// ── Helper Utilities ─────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDate = (
  date: string | Date = new Date(),
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
) => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string"
      ? new Date(`${date.split("T")[0]}T00:00:00`)
      : date;
    return dateObj.toLocaleDateString("en-US", options);
  } catch (e) {
    return typeof date === "string" ? date : "";
  }
};

const formatTime12h = (timeStr: string) => {
  if (!timeStr) return { time: "", period: "" };
  try {
    const parts = timeStr.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1] || 0);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m.toString().padStart(2, "0");
    return {
      time: `${displayHour}:${displayMin}`,
      period,
    };
  } catch (e) {
    return { time: timeStr, period: "" };
  }
};


const getAttendeeAvatars = (attendeesStr: string) => {
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
};

// ── Subcomponents ───────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  // trend?: number;
  hasRedDot?: boolean;
}

function StatsCard({ title, value, icon, iconBg, hasRedDot }: StatsCardProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-[12px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        {/* {trend !== undefined && (
          <span className={`text-[12px] font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )} */}
        {hasRedDot && (
          <span className="absolute top-6 right-6 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className="mt-4">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {value}
        </span>
        <p className="text-[13px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">This month</p>
      </div>
    </div>
  );
}

interface MeetingCardProps {
  meeting: any;
  variant?: "invitation" | "standard";
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onJoin?: (id: number) => void;
}

function MeetingCard({
  meeting,
  variant = "standard",
  onAccept,
  onDecline,
  onJoin,
}: MeetingCardProps) {
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const timeInfo = formatTime12h(meeting.meeting_time);
  const attendeesList = getAttendeeAvatars(meeting.attendees);

  const isCancelled = meeting.status === "cancelled";
  const status = isCancelled ? "cancelled" : meeting.attendee_status;

  // 1. Grid/Invitation Card Layout
  if (variant === "invitation") {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-sm transition-all duration-200">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-800 truncate">
              {meeting.title}
            </h3>
            <span className="bg-amber-50 text-amber-700 border border-amber-100/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(meeting.meeting_date)}
            <span className="text-slate-300">•</span>
            <Clock size={14} />
            {meeting.meeting_time}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2">
            {meeting.description || "No description provided."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(meeting.id)}
            className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={() => onDecline(meeting.id)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-655 border border-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    );
  }

  // 2. Grid Card Layout
  const meetingDate = meeting.meeting_date ? meeting.meeting_date.split("T")[0] : "";
  const meetingTimeStr = meeting.meeting_time || "00:00";
  const startDt = new Date(`${meetingDate}T${meetingTimeStr}`);
  const endDt = meeting.end_time ? new Date(`${meetingDate}T${meeting.end_time}`) : new Date(startDt.getTime() + 30 * 60000);
  const now = new Date();
  const isOngoing = !isCancelled && status === "accepted" && now >= startDt && now <= endDt;

  // Extract first attendee name and capitalize
  let firstAttendeeName = "Someone";
  if (meeting.organizer && typeof meeting.organizer === 'string') {
    firstAttendeeName = meeting.organizer;
  } else if (meeting.organizerName) {
    firstAttendeeName = meeting.organizerName;
  } else if (meeting.createdBy) {
    firstAttendeeName = meeting.createdBy;
  } else if (attendeesList.length > 0) {
    const namePart = attendeesList[0].email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    firstAttendeeName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Calculate simple countdown
  const diffMs = startDt.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  let countdownText = "";
  if (diffMins < 0) {
    countdownText = "Completed";
  } else if (diffMins < 60) {
    countdownText = diffMins === 0 ? "Now" : `In ${diffMins} min`;
  } else if (diffMins < 1440) {
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    countdownText = m > 0 ? `In ${h}h ${m}m` : `In ${h}h`;
  } else {
    const d = Math.floor(diffMins / 1440);
    countdownText = `In ${d} day${d > 1 ? 's' : ''}`;
  }

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
      {/* Top: Time */}
      <div className="mb-3">
        <span className="text-[#4F46E5] font-bold text-[10px] bg-indigo-50 px-2 py-1 rounded-md inline-block">
          {timeInfo.time} {timeInfo.period}
        </span>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="font-bold text-[15px] text-slate-800 leading-tight mb-1 truncate">{meeting.title}</h3>
        <p className="text-[13px] text-slate-500 truncate">With {firstAttendeeName}</p>
      </div>

      {/* Avatars */}
      <div className={`flex ${showAllAttendees ? 'flex-wrap gap-1' : '-space-x-1.5'} overflow-visible mb-4`}>
        {(showAllAttendees ? attendeesList : attendeesList.slice(0, 3)).map((avatar, i) => {
          const bgColors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500"];
          const colorClass = bgColors[i % bgColors.length];
          return (
            <div
              key={i}
              className={`inline-flex h-6 w-6 rounded-full ring-2 ring-white items-center justify-center text-[8px] font-bold text-white uppercase shrink-0 ${colorClass}`}
              title={avatar.email}
            >
              {avatar.initials}
            </div>
          );
        })}
        {!showAllAttendees && attendeesList.length > 3 && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAllAttendees(true);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[8px] font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-200 transition-colors"
          >
            +{attendeesList.length - 3}
          </div>
        )}
        {showAllAttendees && attendeesList.length > 3 && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAllAttendees(false);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[8px] font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-200 transition-colors"
            title="Show less"
          >
            -
          </div>
        )}
      </div>

      {/* Divider & Bottom row */}
      <div className="mt-auto">
        <hr className="mb-3 border-slate-100" />
        <div className="flex items-center justify-between">
          {isOngoing ? (
            <>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-md">Ongoing</span>
              {onJoin && (
                <button onClick={() => onJoin(meeting.id)} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold px-3 py-1.5 rounded-[8px] transition-colors shadow-sm cursor-pointer">
                  Join Meeting
                </button>
              )}
            </>
          ) : (
            <>
               <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${
                 isCancelled ? "text-red-500 bg-red-50" : 
                 status === "pending" ? "text-amber-500 bg-amber-50" : 
                 status === "completed" ? "text-purple-600 bg-purple-50" :
                 "text-[#4F46E5] bg-indigo-50/50"
               }`}>
                 {isCancelled ? "Cancelled" : (status === "pending" ? "Pending" : countdownText)}
               </span>
               <button onClick={onJoin ? () => onJoin(meeting.id) : undefined} className="text-[#4F46E5] text-[11px] font-bold hover:text-indigo-800 transition-colors cursor-pointer outline-none border-none bg-transparent">
                 Video call
               </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [invitations, setInvitations] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchMeetings();
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        "https://localhost:5000/api/meetings/invitations",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        "https://localhost:5000/api/meetings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInvitationAction = async (meetingId: number, action: "accept" | "decline") => {
    try {
      const token = sessionStorage.getItem("token");
      await fetch(
        `https://localhost:5000/api/meetings/${action}/${meetingId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchInvitations();
      fetchMeetings();
    } catch (error) {
      console.error(error);
    }
  };

  const getMeetingDateTime = (meeting: any) => {
    if (!meeting.meeting_date) return new Date(0);
    const datePart = meeting.meeting_date.split("T")[0];
    const timePart = meeting.meeting_time || "00:00";
    return new Date(`${datePart}T${timePart}`);
  };

  const isCompleted = (meeting: any) => {
    if (meeting.status === "cancelled") return false;
    return getMeetingDateTime(meeting) < new Date();
  };

  // Filter invitations to exclude cancelled meetings
  const activeInvitations = invitations.filter((invite) => {
    const match = meetings.find((m) => m.id === invite.id);
    return match ? match.status !== "cancelled" : true;
  });

  const totalCount = meetings.length;
  const completedCount = meetings.filter(isCompleted).length;
  const scheduledCount = meetings.filter(m => m.attendee_status === "accepted" && m.status !== "cancelled" && !isCompleted(m)).length;
  const cancelledCount = meetings.filter(m => m.status === "cancelled").length;

  const firstName = user.name?.split(" ")[0] || "User";
  const greeting = getGreeting();
  const formattedDate = formatDate(new Date(), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const filteredMeetings = meetings.filter((meeting) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Accepted") return meeting.attendee_status === "accepted" && meeting.status !== "cancelled";
    if (activeFilter === "Pending") return meeting.attendee_status === "pending" && meeting.status !== "cancelled";
    if (activeFilter === "Cancelled") return meeting.status === "cancelled";
    if (activeFilter === "Completed") return isCompleted(meeting);
    return true;
  });

  return (
    <MainLayout showRightPanel={true}>
      <div className="w-full space-y-8 pb-12 select-none font-primary">
        {/* Page Heading */}
        <div>
          <p className="text-xs md:text-sm font-semibold text-slate-400">
            {greeting}, {firstName}, it's {formattedDate}
          </p>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            Meeting Dashboard
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Meetings"
            value={totalCount}
            icon={<Calendar size={20} className="text-[#4F46E5]" />}
            iconBg="bg-indigo-50"
            // trend={12}
          />
          <StatsCard
            title="Scheduled Meetings"
            value={scheduledCount}
            icon={<Calendar size={20} className="text-[#3b82f6]" />}
            iconBg="bg-blue-50"
            // trend={8}
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 size={20} className="text-emerald-500" />}
            iconBg="bg-emerald-50"
            // trend={15}
          />
          <StatsCard
            title="Cancelled"
            value={cancelledCount}
            icon={<Clock size={20} className="text-orange-500" />}
            iconBg="bg-orange-50"
            // trend={-2}
          />
        </div>

        {/* Pending Invitations Banner / List */}
        {activeInvitations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Pending Invitations</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {activeInvitations.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeInvitations.map((invite, idx) => (
                <MeetingCard
                  key={`invite-${invite.id}-${idx}`}
                  meeting={invite}
                  variant="invitation"
                  onAccept={(id) => handleInvitationAction(id, "accept")}
                  onDecline={(id) => handleInvitationAction(id, "decline")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Meetings List & Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2 md:mb-0">
              My Meetings &middot; <span className="text-[#4F46E5]">{meetings.length} Meetings</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
              {["All", "Accepted", "Pending", "Cancelled", "Completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer transition-all duration-200
                    ${activeFilter === filter
                      ? "bg-[#2563eb] text-white shadow-xs"
                      : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200/50 rounded-[12px] p-12 text-center shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center w-full mt-4">
              <Calendar size={32} className="text-slate-400 mb-3" />
              <p className="text-[14px] text-slate-500">
                No {activeFilter.toLowerCase()} meetings found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMeetings.map((meeting, idx) => (
                <MeetingCard
                  key={`meeting-${meeting.id}-${idx}`}
                  meeting={meeting}
                  variant="standard"
                  onAccept={(id) => handleInvitationAction(id, "accept")}
                  onDecline={(id) => handleInvitationAction(id, "decline")}
                  onJoin={(id) => navigate(`/meeting/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;