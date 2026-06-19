type HeaderProps = {
  toggleSidebar: () => void;
};

function Header({
  toggleSidebar,
}: HeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-20
        px-8
        pt-6
      "
    >
      <div
        className="
          bg-white/90
          backdrop-blur-xl
          border
          border-[#ECE8E1]
          rounded-3xl
          shadow-sm
          px-6
          py-4
          flex
          items-center
          justify-between
        "
      >
        {/* Left Side */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <button
            onClick={toggleSidebar}
            className="
              h-11
              w-11
              rounded-2xl
              bg-[#F8F6F2]
              flex
              items-center
              justify-center
              text-[#5A5A5A]
              hover:bg-[#F1EEE8]
              transition-all
              duration-300
            "
          >
            ☰
          </button>

          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-[#A0A0A0]
              "
            >
              Workspace
            </p>

            <h1
              className="
                text-xl
                font-semibold
                text-[#2D2D2D]
              "
            >
              Meeting Organizer
            </h1>
          </div>
        </div>

        {/* Right Side */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              hidden
              md:flex
              items-center
              gap-3
              px-4
              py-2
              rounded-2xl
              bg-[#F8F6F2]
            "
          >
            <div
              className="
                h-9
                w-9
                rounded-xl
                bg-[#EFE8DD]
                flex
                items-center
                justify-center
                text-sm
                font-bold
                text-[#7A6855]
              "
            >
              M
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-[#8B8B8B]
                "
              >
                Logged In
              </p>

              <p
                className="
                  text-sm
                  font-medium
                  text-[#2D2D2D]
                "
              >
                Meeting Organizer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;