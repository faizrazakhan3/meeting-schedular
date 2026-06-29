import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";

function MainLayout({
  children,
  showRightPanel = false,
}: {
  children: React.ReactNode;
  showRightPanel?: boolean;
}) {
  // Default to collapsed (small) on desktop/tablet
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-collapse sidebar on tablet screen widths (768px to 1023px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(true); // Default to collapsed on desktop too
      }
    };

    window.addEventListener("resize", handleResize);
    // Run on initial mount
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear the close timeout if user hovers back in before 2000ms
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Open immediately
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Collapse after 2000 milliseconds (2 seconds) of "rest"
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 2000);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      {/* Desktop/Tablet Sidebar (Fixed left sidebar) */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          hidden md:block
          h-screen sticky top-0
          transition-all duration-300 ease-in-out
          shrink-0
          overflow-hidden
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Drawer (off-canvas) */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
        {/* Drawer Content */}
        <div
          className={`
            absolute inset-y-0 left-0 w-72 bg-white shadow-2xl
            transition-transform duration-300 ease-in-out transform
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar
            isCollapsed={false}
            isMobile
            onClose={() => setIsMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-w-0 hide-scrollbar">
            {children}
          </main>

          {/* Right Panel (xl+ only) */}
          {showRightPanel && (
            <aside className="hidden xl:block w-64 shrink-0 border-l border-slate-200/60 overflow-y-auto p-5 bg-app-bg hide-scrollbar">
              <RightPanel />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;