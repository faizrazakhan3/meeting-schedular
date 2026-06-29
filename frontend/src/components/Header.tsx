import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Plus } from "lucide-react";

type Notification = {
  id: number;
  type: "invite" | "reminder";
  meeting_id: number;
  message: string;
  is_read: number;
  created_at: string;
};

type HeaderProps = {
  toggleSidebar: () => void;
};

function Header({ toggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}") as { name?: string; role?: string };
  const userName = user.name || "Mark Johnson";
  const userRole = user.role || "Admin";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch("https://172.20.10.2:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications in Header:", err);
    }
  };

  const handleNotificationsClick = async () => {
    if (dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 8,
        left: rect.right - 320,
      });
    }
    setDropdownOpen((prev) => !prev);

    if (!dropdownOpen && unreadCount > 0) {
      try {
        const token = sessionStorage.getItem("token");
        await fetch("https://172.20.10.2:5000/api/notifications/read", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      } catch (err) {
        console.error("Failed to mark notifications read:", err);
      }
    }
  };

  // Outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll notifications every 10s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-20 px-4 pt-3.5 select-none">
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm px-4 py-2.5 flex items-center justify-between gap-3">

        {/* ── Left: Toggle + Logo ── */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all duration-200 cursor-pointer shrink-0"
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <h1 className="hidden md:block text-base font-bold text-slate-800 whitespace-nowrap">
            Meeting Organizer
          </h1>
        </div>

        {/* ── Center: Global Search ── */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search meetings, people..."
              className="w-full pl-9 pr-16 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 transition-all duration-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 pointer-events-none">
              ⌘K
            </span>
          </div>
        </div>

        {/* ── Right: Create Meeting + Bell + User ── */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Create Meeting button */}
          <button
            onClick={() => navigate("/create-meeting")}
            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl px-3.5 py-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Plus size={14} />
            <span>Create Meeting</span>
          </button>

          {/* Notification Bell */}
          <button
            ref={dropdownButtonRef}
            onClick={handleNotificationsClick}
            className="relative h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
              {initials}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-800 whitespace-nowrap">{userName}</p>
              <p className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notification Dropdown ── */}
      {dropdownOpen && dropdownCoords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${dropdownCoords.top}px`,
              left: `${Math.max(8, dropdownCoords.left)}px`,
              width: "320px",
              maxHeight: "380px",
            }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[9999] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  {notifications.length} total
                </span>
              )}
            </div>
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <span className="text-2xl mb-2">🔔</span>
                  <p className="text-xs font-semibold">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3.5 border-b border-slate-100 transition-colors duration-150 ${
                      notif.is_read === 0 ? "bg-amber-50/40" : "bg-white"
                    } hover:bg-slate-50`}
                  >
                    <span className="text-lg mt-0.5 shrink-0">
                      {notif.type === "invite" ? "📩" : "⏰"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug font-semibold">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-1">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                    {notif.is_read === 0 && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )
      }
    </header>
  );
}

export default Header;