import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  return (
    <div
      className="
        flex
        min-h-screen
        bg-[#F7F6F3]
      "
    >
      {/* Sidebar */}

      <div
  className={`
    transition-all
    duration-300
    overflow-hidden
    ${
      sidebarOpen
        ? "w-[280px] lg:w-[345px]"
        : "w-0"
    }
  `}
>
        <Sidebar />
      </div>

      {/* Main Content */}

      <div
        className="
          flex-1
          flex
          flex-col
        "
      >
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

                <main
            className="
                flex-1
                p-4
                md:p-6
                lg:p-8
                overflow-y-auto
            "
            >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;