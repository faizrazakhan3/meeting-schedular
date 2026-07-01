export const styles = {
 card:
"bg-white/95 backdrop-blur-sm shadow-xl rounded-xl w-full max-w-md px-8 py-8",

  title:
    "text-4xl md:text-5xl font-bold text-slate-800 text-center",

  subtitle:
    "text-center text-xl md:text-2xl font-semibold text-gray-600 mb-6",

 input:
    "w-full px-4 py-3 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition rounded-2xl mb-6 text-base",
  button:
    "w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition text-base font-semibold",
  link:
    "text-primary font-bold hover:underline text-lg",
  header:
   "bg-white/10 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center",

logo:
  "bg-transparent border-2 border-black text-black font-bold text-xl px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:border-white hover:scale-110 hover:shadow-xl cursor-pointer",

  headerTitle:
    "text-2xl font-bold",

  footer:
    "bg-gray-800 text-white text-center py-4",

  dashboardContainer:
  "min-h-screen flex flex-col",

dashboardMain:
  "flex-1 flex",

dashboardContent:
  "flex-1 p-8",

dashboardTitle:
  "text-3xl font-bold mb-4",

dashboardText:
  "text-lg text-gray-700",

calendarSidebar:
  "w-120 bg-white shadow-lg p-6",
  
  calendarCard:
  `
  bg-white/20
  backdrop-blur-lg
  border
  border-black/30
  rounded-2xl
  p-6
  `,
  calendarDate:
  `
  h-12
  w-12
  flex
  items-center
  justify-center
  rounded-xl
  bg-white
  shadow-md
  hover:shadow-lg
  hover:bg-blue-500
  hover:text-white
  transition-all
  duration-300
  cursor-pointer
  `,
sidebarbutton: `
            block
            p-3
            rounded-xl
            hover:bg-gray-100
            hover:text-black
            transition
  `,

//  profileCard: "w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10",
 
profileTitle: `
  text-4xl
  font-bold
  mb-8
`,

profileField: `
  mb-6
  w-full
`,

profileLabel: `
  block
  text-sm
  font-semibold
  text-gray-700
  mb-2
`,

profileValue: "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition",

profileButtonContainer: `
  flex
  justify-end
  mt-8
`,

profileButton: "px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition",

profileLayout: `
  grid
  grid-cols-1
  xl:grid-cols-5
  gap-8
  w-full
`,


eventsCard: `
  xl:col-span-3

  bg-white
  rounded-3xl
  border
  border-gray-200

  shadow-sm

  p-8

  min-h-[650px]
`,

avatarWrapper: `
  flex
  flex-col
  items-center

  pb-8
  mb-8

  border-b
  border-gray-100
`,

avatar: `
  h-24
  w-24

  rounded-full

  bg-gradient-to-r
  from-blue-500
  to-indigo-600

  flex
  items-center
  justify-center

  text-white
  text-3xl
  font-bold

  shadow-lg
`,

designationText: `
  text-gray-500
  mt-2
`,

statusBadge: `
  mt-3

  px-3
  py-1

  rounded-full

  bg-green-100
  text-green-700

  text-sm
  font-medium
`,

errorCard: `
  mt-4

  bg-red-50
  border
  border-red-200

  text-red-700

  rounded-xl

  p-3
`,

saveButton: `
  px-6
  py-3

  rounded-xl

  text-white
  font-semibold

  bg-gradient-to-r
  from-blue-600
  to-indigo-600

  hover:shadow-lg
  hover:-translate-y-0.5

  transition-all
`,
eventCard : ` xl:col-span-3
            bg-white
            rounded-3xl
            border
            border-gray-200
            shadow-sm
            p-8
            min-h-[650px]`,
            profileCard: `
  xl:col-span-2
  bg-white
  rounded-3xl
  border
  border-gray-200
  shadow-sm
  p-8
`,
meetingModel:`w-full
                  border-b
                  border-gray-300
                  py-3
                  focus:outline-none
                  focus:border-blue-600`,
};