import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarPlus,
  LogOut,
} from "lucide-react";

// ── Custom Tooltip Component ────────────────────────────────────────────────
type TooltipProps = {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function Tooltip({ content, children, disabled }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  // Reset visibility state if the tooltip gets disabled (sidebar expands)
  useEffect(() => {
    if (disabled) {
      setVisible(false);
    }
  }, [disabled]);

  return (
    <div
      ref={triggerRef}
      className="relative flex items-center w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {!disabled && visible && coords && createPortal(
        <div
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: "translateY(-50%)",
          }}
          className="z-[9999] px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-md rounded-full border border-slate-200 shadow-md whitespace-nowrap pointer-events-none transition-all duration-100"
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Sidebar Component ────────────────────────────────────────────────────────
type SidebarProps = {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

function Sidebar({
  isCollapsed = false,
  isMobile = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  // User details
  const user = JSON.parse(sessionStorage.getItem("user") || "{}") as { name?: string };
  const userName = user.name || "Mr. Khan";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const getMenuItemClass = (isActive: boolean) => {
    return `
      w-full
      flex
      items-center
      ${isCollapsed ? "justify-center" : "gap-3"}
      px-3.5
      py-3
      rounded-xl
      transition-all
      duration-250
      font-semibold
      text-sm
      ${isActive
        ? "bg-slate-100/95 text-slate-800 border border-slate-250/30 shadow-xs backdrop-blur-sm"
        : isCollapsed
          ? "text-slate-600 hover:bg-slate-100/50 hover:backdrop-blur-sm hover:text-slate-900 hover:shadow-2xs border border-transparent hover:border-slate-200/40"
          : "text-slate-600 hover:bg-slate-100/50 hover:backdrop-blur-sm hover:text-slate-900 border border-transparent hover:border-slate-200/45"
      }
    `;
  };

  return (
    <aside className="w-full h-full flex flex-col justify-between bg-white border-r border-slate-200/80 select-none">
      {/* Top Header/Logo */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-slate-100`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 font-bold text-base shrink-0 shadow-sm border border-slate-200">
            M
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-200 whitespace-nowrap overflow-hidden">
              <h2 className="text-sm font-bold text-slate-900 leading-tight">MTO</h2>
              <p className="text-[10px] text-slate-400 font-semibold">Meeting Organizer</p>
            </div>
          )}
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="Close Menu"
          >
            <span className="text-sm font-semibold">✕</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto hide-scrollbar flex flex-col justify-center">

        {/* Dashboard */}
        <Tooltip content="Dashboard" disabled={!isCollapsed}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => getMenuItemClass(isActive)}
            onClick={isMobile && onClose ? onClose : undefined}
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </NavLink>
        </Tooltip>

        {/* Create Meeting */}
        <Tooltip content="Create Meeting" disabled={!isCollapsed}>
          <NavLink
            to="/create-meeting"
            className={({ isActive }) => getMenuItemClass(isActive)}
            onClick={isMobile && onClose ? onClose : undefined}
          >
            <CalendarPlus size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Create Meeting</span>}
          </NavLink>
        </Tooltip>

        {/* Profile */}
        <Tooltip content="Profile" disabled={!isCollapsed}>
          <NavLink
            to="/profile"
            className={({ isActive }) => getMenuItemClass(isActive)}
            onClick={isMobile && onClose ? onClose : undefined}
          >
            <User size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Profile</span>}
          </NavLink>
        </Tooltip>


      </div>

      {/* Bottom User Area & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        {/* Logout */}
        <Tooltip content="Logout" disabled={!isCollapsed}>
          <button
            onClick={handleLogout}
            className={`
              w-full
              flex
              items-center
              ${isCollapsed ? "justify-center" : "gap-3"}
              px-3.5
              py-3
              rounded-xl
              transition-all
              duration-200
              font-semibold
              text-sm
              ${isCollapsed
                ? "text-red-500 hover:bg-red-500/15 hover:backdrop-blur-sm hover:text-red-600 border border-transparent hover:border-red-500/20"
                : "text-red-500 hover:bg-red-500/10 hover:backdrop-blur-sm hover:text-red-600 border border-transparent hover:border-red-500/10"
              }
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </Tooltip>

        {/* User Badge */}
        <div className={`flex items-center ${isCollapsed ? "justify-center py-2" : "gap-3 p-2"} rounded-xl transition-all duration-200`}>
          <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300 shadow-2xs">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">
                Logged In
              </p>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;