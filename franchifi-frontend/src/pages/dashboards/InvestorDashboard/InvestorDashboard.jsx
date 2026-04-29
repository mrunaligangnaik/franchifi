import { Outlet } from "react-router-dom";
import NavbarDashboard from "../../../components/dashboard/NavbarDashboard";

const InvestorDashboard = () => {
  return (
    <>
      <NavbarDashboard />
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-6">
        <Outlet />
      </div>
    </>
  );
};

export default InvestorDashboard;
