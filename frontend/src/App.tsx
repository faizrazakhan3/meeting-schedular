import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./protectedRoute";
import LoadingScreen from "./components/LoadingScreen";

// Lazy-loaded routes
const Profile = lazy(() => import("./pages/Profile"));
const CreateMeeting = lazy(() => import("./pages/CreateMeeting"));
const MeetingRoom = lazy(() => import("./pages/MeetingRoom"));

type PAGES = 'login' | 'register' | 'dashboard' | 'profile' | 'createMeeting' | 'meetingRoom';

const ROUTES: Record<PAGES, string> = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: "/profile",
  createMeeting: '/create-meeting',
  meetingRoom: '/meeting/:roomId',
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path={ROUTES.login} element={<Login />} />
          <Route path={ROUTES.register} element={<Register />} />
          <Route path={ROUTES.dashboard} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path={ROUTES.profile} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path={ROUTES.createMeeting} element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
          <Route path={ROUTES.meetingRoom} element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;