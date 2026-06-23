import { useState, useEffect, useRef } from "react";

type HeaderProps = {
  toggleSidebar: () => void;
};

type Notification = {
  id: number;
  type: "invite" | "reminder";
  meeting_id: number;
  message: string;
  is_read: number;
  created_at: string;
};

function Header({ toggleSidebar }: HeaderProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}") as { name?: string };

  const initials = user.name
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase() || "U";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  // ── fetch notifications from backend ─────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("https://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // ── mark all as read when dropdown opens ─────────────────────────────────
  const handleBellClick = async () => {
    setDropdownOpen((prev) => !prev);

    if (!dropdownOpen && unreadCount > 0) {
      try {
        const token = localStorage.getItem("token");
        await fetch("https://localhost:5000/api/notifications/read", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        // Optimistically mark all as read locally
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: 1 }))
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  // ── close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── fetch on mount & poll every 10s for updates ────────────────────────────
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
    <header className="sticky top-0 z-20 px-8 pt-6">
      <div
        className="
          bg-white/90
          backdrop-blur-xl
          border border-[#ECE8E1]
          rounded-3xl
          shadow-sm
          px-6 py-4
          flex items-center justify-between
        "
      >
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="h-11 w-11 rounded-2xl bg-[#F8F6F2] flex items-center justify-center text-[#5A5A5A] hover:bg-[#F1EEE8] transition-all duration-300"
          >
            ☰
          </button>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#A0A0A0]">Workspace</p>
            <h1 className="text-xl font-semibold text-[#2D2D2D]">Meeting Organizer</h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="notification-bell"
              onClick={handleBellClick}
              className="h-11 w-11 rounded-2xl bg-[#F8F6F2] flex items-center justify-center text-[#7A6855] hover:bg-[#EFE8DD] transition-all duration-300"
              title="Notifications"
            >
              {/* Bell SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>

              {/* Badge */}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#7A6855] text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-14 w-80 bg-white border border-[#ECE8E1] rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECE8E1]">
                  <h3 className="font-semibold text-[#2D2D2D] text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs text-[#8B8B8B]">
                      {notifications.length} total
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-[#A0A0A0]">
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 px-5 py-4 border-b border-[#F5F3EF] transition-colors duration-150 ${notif.is_read === 0 ? "bg-[#F5F1EA]" : "bg-white"
                          } hover:bg-[#FAF7F3]`}
                      >
                        <span className="text-xl mt-0.5 shrink-0">
                          {notif.type === "invite" ? "📩" : "⏰"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2D2D2D] leading-snug">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-[#A0A0A0] mt-1">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>
                        {notif.is_read === 0 && (
                          <span className="h-2 w-2 rounded-full bg-[#C4A882] mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User badge */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#F8F6F2]">
            <div className="h-9 w-9 rounded-xl bg-[#EFE8DD] flex items-center justify-center text-sm font-bold text-[#7A6855]">
              {initials}
            </div>
            <div>
              <p className="text-xs text-[#8B8B8B]">Logged In</p>
              <p className="text-sm font-medium text-[#2D2D2D]">
                {user.name || "Meeting Organizer"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;