import MainLayout from "../layout/Mainlayout";

function Profile() {
  const user = JSON.parse(
    sessionStorage.getItem("user") || "{}"
  );

  const initials =
    user.name
      ?.split(" ")
      .map(
        (word: string) => word[0]
      )
      .join("")
      .toUpperCase() || "U";

  return (
    <MainLayout>
      <div
        className="
        w-full
        space-y-8
        "
      >
        <div
          className="
            bg-white
            rounded-3xl
            border
            border-[#ECE8E1]
            shadow-sm
            p-10
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-8
            "
          >
            <div>
              <p
                className="
                  text-sm
                  uppercase
                  tracking-widest
                  text-[#A0A0A0]
                "
              >
                Welcome Back
              </p>

              <h1
                className="
                  text-5xl
                  font-bold
                  text-[#2D2D2D]
                  mt-3
                "
              >
                {user.name}
              </h1>

              <p
                className="
                  mt-4
                  text-lg
                  text-[#7A7A7A]
                "
              >
                {user.email}
              </p>
            </div>

            <div
              className="
                h-28
                w-28
                rounded-3xl
                bg-[#F5F1EA]
                flex
                items-center
                justify-center
                text-4xl
                font-bold
                text-[#6B5D4D]
              "
            >
              {initials}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;