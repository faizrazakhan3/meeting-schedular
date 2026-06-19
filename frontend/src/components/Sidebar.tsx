import {
  LayoutDashboard,
  User,
  CalendarPlus,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuClass = ({ isActive }: any) =>
    `
      flex
      items-center
      gap-3
      px-4
      py-3
      rounded-2xl
      transition-all
      duration-300
      font-medium
      ${
        isActive
          ? `
            bg-white
            text-[#2D2D2D]
            shadow-sm
            border
            border-[#E8E5DE]
          `
          : `
            text-[#6B6B6B]
            hover:bg-white
            hover:text-[#2D2D2D]
          `
      }
    `;

  return (
    <aside
      className="
        h-full
        px-5
        py-6
      "
    >
      <div
        className="
          h-full
          bg-white
          rounded-3xl
          border
          border-[#ECE8E1]
          shadow-sm
          flex
          flex-col
        "
      >
        {/* Logo Section */}

        <div
          className="
            px-6
            py-6
            border-b
            border-[#F2EEE8]
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                h-12
                w-12
                rounded-2xl
                bg-[#F4EFE8]
                flex
                items-center
                justify-center
                text-[#7A6855]
                font-bold
                text-lg
              "
            >
              M
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-semibold
                  text-[#2D2D2D]
                "
              >
                MTO
              </h2>

              <p
                className="
                  text-xs
                  text-[#8B8B8B]
                "
              >
                Meeting Organizer
              </p>
            </div>
          </div>
        </div>

        {/* User Area */}

        <div
          className="
            mx-4
            mt-5
            p-4
            rounded-2xl
            bg-[#F8F6F2]
          "
        >
          <p
            className="
              text-xs
              text-[#8B8B8B]
            "
          >
            Welcome Back
          </p>

          <h3
            className="
              mt-1
              font-semibold
              text-[#2D2D2D]
            "
          >
            Mr. Khan
          </h3>
        </div>

        {/* Menu */}

        <div
          className="
            flex-1
            px-4
            py-6
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-widest
              text-[#A3A3A3]
              mb-4
              px-2
            "
          >
            Navigation
          </p>

          <div className="space-y-2">

            <NavLink
              to="/dashboard"
              className={menuClass}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink
              to="/profile"
              className={menuClass}
            >
              <User size={20} />
              Profile
            </NavLink>

            <NavLink
              to="/create-meeting"
              className={menuClass}
            >
              <CalendarPlus size={20} />
              Create Meeting
            </NavLink>

          </div>
        </div>

        {/* Logout */}

        <div
          className="
            p-4
            border-t
            border-[#F2EEE8]
          "
        >
          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              text-[#B76E5D]
              font-medium
              transition-all
              duration-300
              hover:bg-[#FBF3F1]
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;