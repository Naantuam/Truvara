import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import ResetPassword from "./UserDetail/ResetPassword";
import ActivateAccount from './UserDetail/ActivateAccount';
import SecuritySettings from "./UserDetail/SecuritySettings";
import Unauthorized from "./Pages/Auth/Unauthorized";

import Layout from "./Reusable/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "./Pages/AdminDashboard/Dashboard";

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Login />} />
      <Route path="/mfa" element={<MFA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
      {/* Main Pages with Unified Layout */}
      <Route element={<Layout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Dashboard - "admin_only" for base access */}
        <Route path="/dashboard" element={<ProtectedRoute app="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/security" element={<SecuritySettings />} />
      </Route>
    </Routes>
  );
}

export default App;
