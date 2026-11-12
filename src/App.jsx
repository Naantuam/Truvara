import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import LandingPage from "./Pages/Landing/LandingPage";
import ComingSoon from "./Pages/Landing/ComingSoon";
import Login from "./UserDetail/Login";
import SelectCompany from "./UserDetail/SelectCompany";
import Signup from "./UserDetail/Signup";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import ActivateAccount from './UserDetail/ActivateAccount';
import AcceptInvitation from './UserDetail/AcceptInvitation';
import SecuritySettings from "./UserDetail/SecuritySettings";
import Unauthorized from "./Pages/Auth/Unauthorized";

import Layout from "./Reusable/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "./Pages/AdminDashboard/Dashboard";
import DecisionsPage from "./Pages/Decisions/DecisionsPage";
import ApprovalsPage from "./Pages/Approvals/ApprovalsPage";
import ResponsibilitiesPage from "./Pages/Responsibilities/ResponsibilitiesPage";
import ActionsPage from "./Pages/Actions/ActionsPage";
import ExpensesPage from "./Pages/Expenses/ExpensesPage";
import ReportsPage from "./Pages/Reports/ReportsPage";
import SettingsPage from "./Pages/Settings/SettingsPage";

function App() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Signup />} />
      {/* Old address, kept so links already shared still work */}
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/privacy" element={<ComingSoon title="Privacy Notice" message="Our Privacy Notice is being finalized. Check back soon, or get in touch if you have questions now." />} />
      <Route path="/terms" element={<ComingSoon title="Terms of Use" message="Our Terms of Use are being finalized. Check back soon, or get in touch if you have questions now." />} />
      <Route path="/support" element={<ComingSoon title="Support" message="A dedicated support page is on its way. In the meantime, reach out directly and we'll help." />} />
      <Route path="/about" element={<ComingSoon title="About Truvara" message="Our About page is being finalized. Check back soon to learn more about Truvara." />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/select-company" element={<SelectCompany />} />
      <Route path="/mfa" element={<MFA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/invite" element={<AcceptInvitation />} />
      {/* Main Pages with Unified Layout */}
      <Route element={<Layout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Dashboard - "admin_only" for base access */}
        <Route path="/dashboard" element={<ProtectedRoute app="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/decisions" element={<ProtectedRoute app="decisions"><DecisionsPage /></ProtectedRoute>} />
        <Route path="/approvals" element={<ProtectedRoute app="approvals"><ApprovalsPage /></ProtectedRoute>} />
        <Route path="/responsibilities" element={<ProtectedRoute app="responsibilities"><ResponsibilitiesPage /></ProtectedRoute>} />
        <Route path="/actions" element={<ProtectedRoute app="actions"><ActionsPage /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute app="expenses"><ExpensesPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute app="reports"><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
