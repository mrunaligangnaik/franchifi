import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Investor from "./pages/Investor";
import Franchisor from "./pages/Franchisor";
import About from "./pages/About";
import FranchiseDetails from "./pages/FranchiseDetails";
import ApplyFranchise from "./pages/ApplyFranchise";

import InvestorDashboard from "./pages/dashboards/InvestorDashboard/InvestorDashboard";
import InvestorMarketplace from "./pages/dashboards/InvestorDashboard/InvestorMarketplace";
import InvestorAbout from "./pages/dashboards/InvestorDashboard/InvestorAbout";
import InvestorProfile from "./pages/dashboards/InvestorDashboard/InvestorProfile";
import MyApplications from "./pages/dashboards/InvestorDashboard/MyApplications";
import InvestorApplicationView from "./pages/dashboards/InvestorDashboard/InvestorApplicationView";

import FranchisorDashboard from "./pages/dashboards/FranchisorDashboard/FranchisorDashboard";
import FranchisorHome from "./pages/dashboards/FranchisorDashboard/FranchisorHome";
import FranchisorApplications from "./pages/dashboards/FranchisorDashboard/FranchisorApplications";
import FranchisorProfile from "./pages/dashboards/FranchisorDashboard/FranchisorProfile";
import FranchisorSettings from "./pages/dashboards/FranchisorDashboard/FranchisorSettings";
import FranchisorCompany from "./pages/dashboards/FranchisorDashboard/FranchisorCompany";


import AdminDashboard from "./pages/dashboards/AdminDashboard/AdminDashboard";
import Verification from "./pages/dashboards/AdminDashboard/Verification";
import FranchiseApproval from "./pages/dashboards/AdminDashboard/FranchiseApproval"; 
import Users from "./pages/dashboards/AdminDashboard/Users";

/* ✅ NEW IMPORTS */
import Settings from "./pages/dashboards/AdminDashboard/Settings";
import Companies from "./pages/dashboards/AdminDashboard/Companies";
import AddCompany from "./pages/dashboards/AdminDashboard/AddCompany";
import EditCompany from './pages/dashboards/AdminDashboard/EditCompany';

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/dashboard/AdminProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Unauthorized page */
const Unauthorized = () => (
  <div className="p-10 text-center text-red-600 text-lg">
    You are not authorized to access this page.
  </div>
);

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboardRoute && <Navbar />}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/franchise/:id" element={<FranchiseDetails />} />
        <Route path="/investor" element={<Investor />} />
        <Route path="/Franchisor" element={<Franchisor />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* INVESTOR DASHBOARD */}
        <Route
          path="/dashboard/investor"
          element={
            <ProtectedRoute>
              <InvestorDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<InvestorMarketplace />} />
          <Route path="marketplace" element={<InvestorMarketplace />} />
          <Route path="franchise/:id" element={<FranchiseDetails />} />
          <Route path="apply/:id" element={<ApplyFranchise />} />
          <Route path="applications" element={<MyApplications />} />
          <Route
            path="applications/:applicationId"
            element={<InvestorApplicationView />}
          />
          <Route path="about" element={<InvestorAbout />} />
          <Route path="profile" element={<InvestorProfile />} />
        </Route>

        {/* FRANCHISOR DASHBOARD */}
        <Route
          path="/dashboard/Franchisor"
          element={
            <ProtectedRoute role="Franchisor">
              <FranchisorDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<FranchisorHome />} />
          <Route path="applications" element={<FranchisorApplications />} />
          <Route path="company" element={<FranchisorCompany />} />
          <Route path="profile" element={<FranchisorProfile />} />
          <Route path="settings" element={<FranchisorSettings />} />
        </Route>

        {/* ADMIN DASHBOARD */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        >
          <Route path="verification" element={<Verification />} />
          <Route path="franchises" element={<FranchiseApproval />} />
          <Route path="users" element={<Users />} />

          {/* ✅ NEW ROUTES */}
          <Route path="settings" element={<Settings />} />
          <Route path="companies" element={<Companies />} />
          <Route path="add-company" element={<AddCompany />} />
          <Route path="edit-company/:id" element={<EditCompany />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;