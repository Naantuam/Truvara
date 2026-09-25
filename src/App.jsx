import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import SelectCompany from "./UserDetail/SelectCompany";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import ResetPassword from "./UserDetail/ResetPassword";
import ActivateAccount from './UserDetail/ActivateAccount';
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
      {/* Auth routes */}
      <Route path="/" element={<Login />} />
      <Route path="/select-company" element={<SelectCompany />} />
      <Route path="/mfa" element={<MFA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/activate" element={<ActivateAccount />} />
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
