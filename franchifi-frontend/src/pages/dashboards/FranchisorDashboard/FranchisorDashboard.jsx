import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiCheckCircle, FiLogOut, FiUser, FiSettings, FiBriefcase } from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NotificationBell from "../../../components/dashboard/NotificationBell";

const FranchisorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-60 bg-[#1a1d29] border-r border-gray-800 fixed h-full z-20 shadow-sm"
      >
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h1 className="text-xl font-bold text-white">
              Franchi<span className="text-gray-400">Fi</span>
            </h1>
            <span className="text-xs text-gray-400 font-medium">Franchisor Panel</span>
          </motion.div>
          <NotificationBell position="left" darkMode={true} />
        </div>

        <nav className="p-3 space-y-1">
          {[
            { to: "/dashboard/Franchisor", icon: <FiGrid size={18} />, text: "Dashboard", end: true },
            { to: "/dashboard/Franchisor/applications", icon: <FiCheckCircle size={18} />, text: "Applications" },
            { to: "/dashboard/Franchisor/company", icon: <FiBriefcase size={18} />, text: "My Company" },
            { to: "/dashboard/Franchisor/profile", icon: <FiUser size={18} />, text: "My Profile" },
            { to: "/dashboard/Franchisor/settings", icon: <FiSettings size={18} />, text: "Settings" },
          ].map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.07 }}
            >
              <NavItem to={item.to} icon={item.icon} text={item.text} end={item.end} />
            </motion.div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-60 p-3 border-t border-gray-800 bg-[#1a1d29]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-600">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "F"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "Franchisor"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ backgroundColor: "#7f1d1d", color: "#fca5a5" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-900 hover:text-red-300 transition-all text-sm font-medium cursor-pointer"
            >
              <FiLogOut size={18} />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      <main className="ml-60 flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, text, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`
    }
  >
    {icon}
    <span>{text}</span>
  </NavLink>
);

export default FranchisorDashboard;