import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Welcome from "../screens/Welcome";
import SignUp from "../screens/SignUp";
import ReportLost from "../screens/PostLost";
import Home from "../screens/Home";
import SelectZone from "../screens/SelectZone";
import ReportFound from "../screens/PostFound";
import SmartMatches from "../screens/SmartMatches";
import ItemDetails from "../screens/ItemDetails";
import ProfileSettings from "../screens/Profile";
import ChatPage from "../screens/Chat";
import ChatInbox from "../screens/ChatInbox";
import SignIn from "../screens/SignIn";
import AdminSignIn from "../screens/AdminSignIn";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import TermsOfService from "../screens/TermsOfService";
import HelpCenter from "../screens/HelpCenter";
import HowItWorks from "../screens/HowItWorks";
import AdminDashboard from "../screens/AdminDashboard";
import NotFound from "../screens/NotFound";
import { useAuthUser } from "../hooks/useAuthUser";

const ProtectedRoute = ({ children }) => {
  const user = useAuthUser();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const user = useAuthUser();
  if (user) {
    const isAdmin = user.role === "admin";
    return <Navigate to={isAdmin ? "/admin" : "/home"} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = useAuthUser();
  if (!user) {
    return <Navigate to="/admin/signin" replace />;
  }
  const isAdmin = user.role === "admin";
  if (!isAdmin) {
    return <Navigate to="/admin/signin" replace />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/admin/signin"
          element={
            <PublicRoute>
              <AdminSignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lost"
          element={
            <ProtectedRoute>
              <ReportLost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lost/zone"
          element={
            <ProtectedRoute>
              <SelectZone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/found"
          element={
            <ProtectedRoute>
              <ReportFound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <SmartMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item/:id"
          element={
            <ProtectedRoute>
              <ItemDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
