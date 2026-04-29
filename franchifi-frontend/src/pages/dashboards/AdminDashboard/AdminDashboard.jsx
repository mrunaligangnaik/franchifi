import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Building2, FileText, CheckCircle, Clock, Search,
  Settings, Home, Shield, LogOut, TrendingUp, TrendingDown
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import NotificationBell from "../../../components/dashboard/NotificationBell";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalFranchises: 0, totalApplications: 0,
    pendingApplications: 0, approvedApplications: 0, revenue: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const isRootDashboard = location.pathname === "/dashboard/admin";
  const { token } = useAuth();

  useEffect(() => { fetchDashboardData(); }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await fetch("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      const statsData = await statsRes.json();
      setStats(statsData);
      const appsRes = await fetch("http://localhost:5000/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } });
      const appsData = await appsRes.json();
      if (Array.isArray(appsData)) {
        const pendingApps = appsData.filter(app => app.status === "submitted" || app.status === "pending" || app.status === "shortlisted").slice(0, 5);
        setRecentApplications(pendingApps);
        generateMonthlyData(appsData);
        generateRecentAlerts(appsData);
      }
    } catch (err) { console.error("Failed to fetch dashboard data:", err); }
    finally { setLoading(false); }
  };

  const generateMonthlyData = (applications) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = months.map((month, index) => {
      const monthApps = applications.filter(app => new Date(app.createdAt).getMonth() === index);
      return { month, applications: monthApps.length, approved: monthApps.filter(app => app.status === "approved").length };
    });
    setMonthlyData(data);
  };

  const generateRecentAlerts = (applications) => {
    const alerts = applications.slice(0, 5).map(app => ({
      title: app.status === "approved" ? "Application Approved" : app.status === "shortlisted" ? "Application Shortlisted" : "New Application Submitted",
      message: `${app.investor?.name || "Unknown"} - ${app.franchiseName || "Franchise"}`,
      time: getTimeAgo(app.createdAt),
      type: app.status
    }));
    setRecentAlerts(alerts);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">{label}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="text-3xl font-bold text-gray-900"
          >
            {(value ?? 0).toLocaleString()}
          </motion.p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-medium">{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
        </motion.div>
      </div>
    );
  }

  const navLinks = [
    { to: "/dashboard/admin", icon: <Home size={18} />, label: "Dashboard", end: true },
    { to: "/dashboard/admin/users", icon: <Users size={18} />, label: "Users" },
    { to: "/dashboard/admin/companies", icon: <Building2 size={18} />, label: "Companies" },
    { to: "/dashboard/admin/verification", icon: <Shield size={18} />, label: "Verifications" },
    { to: "/dashboard/admin/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-60 bg-linear-to-b from-gray-900 to-gray-800 text-white fixed h-full z-20"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 border-b border-gray-700"
        >
          <div>
            <h1 className="text-lg font-bold whitespace-nowrap">Franchi<span className="text-gray-500">Fi</span></h1>
            <span className="text-[10px] text-gray-400">Admin Panel</span>
          </div>
        </motion.div>

        <nav className="p-3 space-y-1">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.07 }}
            >
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5"}`
                }
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="absolute bottom-0 w-60 p-3 border-t border-gray-700"
        >
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className="ml-60 flex-1">
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white border-b border-gray-200 sticky top-0 z-10"
        >
          <div className="px-6 py-3.5 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">System Overview</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search system..." className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-56" />
              </div>
              <NotificationBell position="right" darkMode={false} />
              <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">AD</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="p-6">
          {isRootDashboard ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {[
                  { icon: Users, label: "TOTAL USERS", value: stats.totalUsers, trend: 12 },
                  { icon: Building2, label: "REGISTERED COMPANIES", value: stats.totalFranchises, trend: 8 },
                  { icon: Clock, label: "PENDING APPROVALS", value: stats.pendingApplications, trend: -5 },
                  { icon: CheckCircle, label: "ACTIVE FRANCHISES", value: stats.approvedApplications, trend: 15 },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  >
                    <StatCard icon={s.icon} label={s.label} value={s.value} trend={s.trend} />
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Platform Growth Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="lg:col-span-2 bg-white rounded-lg p-5 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-gray-900">Platform Growth</h2>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-900 rounded"></div><span className="text-gray-600">Applications</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded"></div><span className="text-gray-600">Approved</span></div>
                    </div>
                  </div>
                  <div className="h-56 flex items-end justify-around gap-3">
                    {monthlyData.length > 0 ? monthlyData.map((item, i) => {
                      const maxValue = Math.max(...monthlyData.map(d => Math.max(d.applications, d.approved)));
                      const scale = maxValue > 0 ? 150 / maxValue : 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex gap-1 items-end h-44 relative group">
                            <div className="flex-1 relative">
                              <div className="w-full bg-gray-900 rounded-t transition-all duration-300 hover:bg-gray-800" style={{ height: `${Math.max(item.applications * scale, 5)}px` }}></div>
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.applications} apps</div>
                            </div>
                            <div className="flex-1 relative">
                              <div className="w-full bg-gray-400 rounded-t transition-all duration-300 hover:bg-gray-500" style={{ height: `${Math.max(item.approved * scale, 5)}px` }}></div>
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.approved} approved</div>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-600 font-medium">{item.month}</span>
                        </div>
                      );
                    }) : <div className="text-center text-gray-500 text-sm">No data available</div>}
                  </div>
                </motion.div>

                {/* Recent Alerts */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.42 }}
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
                >
                  <h2 className="text-base font-bold text-gray-900 mb-4">Recent Alerts</h2>
                  <div className="space-y-3.5">
                    {recentAlerts.length > 0 ? recentAlerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.07 }}
                        className="flex gap-2.5"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.type === 'approved' ? 'bg-green-600' : alert.type === 'rejected' ? 'bg-red-600' : alert.type === 'shortlisted' ? 'bg-purple-600' : 'bg-gray-900'}`}></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{alert.title}</p>
                          <p className="text-[11px] text-gray-500">{alert.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{alert.time}</p>
                        </div>
                      </motion.div>
                    )) : <div className="text-center text-gray-500 text-xs py-4">No recent alerts</div>}
                  </div>
                </motion.div>
              </div>

              {/* Pending Verifications Table */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Pending Verifications</h2>
                  <span className="text-xs text-gray-500 font-medium">{recentApplications.length} pending applications</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["ENTITY NAME", "FRANCHISE", "SUBMITTED", "STATUS", "PAYMENT"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentApplications.length > 0 ? recentApplications.map((app, i) => (
                        <motion.tr
                          key={app._id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: 0.55 + i * 0.07 }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-gray-900 to-gray-600 flex items-center justify-center">
                                {app.investor?.avatar ? <img src={app.investor.avatar} alt={app.investor?.name} className="w-full h-full object-cover" /> : <span className="text-white text-xs font-semibold">{app.investor?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{app.investor?.name || "Unknown"}</p>
                                <p className="text-[11px] text-gray-500">{app.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{app.franchiseName || "Not Specified"}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : app.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {(app.status || "Submitted").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${app.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {app.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-5 py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-10 h-10 text-gray-300" />
                              <p className="text-sm font-medium text-gray-900">No pending applications</p>
                              <p className="text-xs text-gray-500">All applications have been processed</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;