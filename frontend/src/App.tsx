import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import CreateMeeting from "./pages/CreateMeeting";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./protectedRoute";

type PAGES = 'login' | 'register' | 'dashboard' | 'profile' | 'createMeeting';

const ROUTES: Record<PAGES, string> = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: "/profile",
  createMeeting: '/create-meeting',
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
        <Route path={ROUTES.dashboard} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path={ROUTES.profile} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path={ROUTES.createMeeting} element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;