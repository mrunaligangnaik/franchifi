import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiMapPin } from "react-icons/fi";
import {
  coffee, restaurant, retail, fitness, beauty, education, automotive,
} from "../../../assets";

const FranchisorHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalApplications: 0, pendingReview: 0, approved: 0, rejected: 0 });
  const [applications, setApplications] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);

  const imageMap = {
    "coffee.jpg": coffee, "restaurant.jpg": restaurant, "retail.jpg": retail,
    "fitness.jpg": fitness, "beauty.jpg": beauty, "education.jpg": education, "automotive.jpg": automotive,
  };

  useEffect(() => {
    fetchFranchises();
    fetchStats();
    fetchApplications();
  }, []);

  const fetchFranchises = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/franchises/my/franchises", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFranchises(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/Franchisor/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/Franchisor/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data.slice(0, 5));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this application?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/Franchisor/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Application ${newStatus} successfully!`);
      fetchStats();
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back!</p>
        </motion.div>

        {/* My Franchises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">My Franchises</h2>
            <span className="text-xs text-gray-500 font-medium">{franchises.length} Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {franchises.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
              >
                <p className="text-gray-500 text-sm">No franchises yet</p>
              </motion.div>
            ) : (
              franchises.map((franchise, i) => (
                <motion.div
                  key={franchise._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.08 }}
                >
                  <FranchiseCard franchise={franchise} imageMap={imageMap} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[
            { icon: FiFileText, label: "TOTAL APPLICATIONS", value: stats.totalApplications },
            { icon: FiClock,    label: "PENDING REVIEW",     value: stats.pendingReview },
            { icon: FiCheckCircle, label: "APPROVED",        value: stats.approved },
            { icon: FiXCircle, label: "REJECTED",            value: stats.rejected },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
            >
              <StatCard icon={s.icon} label={s.label} value={s.value} />
            </motion.div>
          ))}
        </div>

        {/* Recent Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
            {applications.length > 0 && (
              <button
                onClick={() => navigate("/dashboard/Franchisor/applications")}
                className="text-xs text-gray-500 font-medium hover:text-gray-900 transition-colors"
              >
                View All →
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">No applications yet</p>
              <p className="text-xs text-gray-500">Applications will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Investor</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Franchise</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app, i) => (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            {app.investor?.avatar ? (
                              <img src={app.investor.avatar} alt={app.investor?.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-xs font-bold">
                                {app.investor?.name?.charAt(0).toUpperCase() || app.fullName?.charAt(0).toUpperCase() || "I"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{app.investor?.name || app.fullName || "Unknown"}</p>
                            <p className="text-[11px] text-gray-500">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{app.franchiseName}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={app.status} /></td>
                      <td className="px-5 py-3.5">
                        {app.status === "submitted" || app.status === "pending" ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusUpdate(app._id, "approved")} className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Approve</button>
                            <button onClick={() => handleStatusUpdate(app._id, "rejected")} className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reject</button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No action needed</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const FranchiseCard = ({ franchise, imageMap }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,0.10)" }}
    transition={{ duration: 0.25 }}
    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
  >
    <div className="relative h-40 bg-gray-100 overflow-hidden group">
      <img
        src={imageMap[franchise.image] || franchise.image}
        alt={franchise.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x250?text=Franchise"; }}
      />
      <span className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-medium rounded-full ${franchise.status === "approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
        {franchise.status?.toUpperCase()}
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{franchise.name}</h3>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{franchise.description}</p>
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <FiMapPin className="w-3.5 h-3.5 mr-1" /><span>{franchise.location}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Min Investment</p>
          <p className="font-bold text-gray-900 text-sm">₹{franchise.minInvestment?.toLocaleString()}</p>
        </div>
        <div className="flex items-center text-gray-500">
          <FiTrendingUp className="w-3.5 h-3.5 mr-1" />
          <span className="text-xs">{franchise.views || 0} views</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
    transition={{ duration: 0.25 }}
    className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
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
          {value || 0}
        </motion.p>
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
      </div>
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    submitted: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    shortlisted: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${styles[status] || styles.pending}`}>
      {status?.toUpperCase() || "PENDING"}
    </span>
  );
};

export default FranchisorHome;