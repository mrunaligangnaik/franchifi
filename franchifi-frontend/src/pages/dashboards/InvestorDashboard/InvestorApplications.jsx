import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

// ── Local image map (same as Marketplace) ────────────────────────
import coffee     from "../../../assets/franchises/coffee.jpg";
import restaurant from "../../../assets/franchises/restaurant.jpg";
import retail     from "../../../assets/franchises/retail.jpg";
import fitness    from "../../../assets/franchises/fitness.jpg";
import beauty     from "../../../assets/franchises/beauty.jpg";
import education  from "../../../assets/franchises/education.jpg";
import automotive from "../../../assets/franchises/automotive.jpg";

const imageMap = {
  "coffee.jpg":     coffee,
  "restaurant.jpg": restaurant,
  "retail.jpg":     retail,
  "fitness.jpg":    fitness,
  "beauty.jpg":     beauty,
  "education.jpg":  education,
  "automotive.jpg": automotive,
};

// ── Status badge style ─────────────────────────────────────────────
const statusStyle = (status) => {
  if (status === "approved")     return "bg-green-50 text-green-700 border border-green-200";
  if (status === "under_review") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (status === "rejected")     return "bg-red-50 text-red-600 border border-red-200";
  return "bg-gray-100 text-gray-600 border border-gray-200";
};

const statusText = (status) => {
  if (status === "approved")     return "Approved";
  if (status === "under_review") return "Under Review";
  if (status === "rejected")     return "Rejected";
  return "Submitted";
};

// ─────────────────────────────────────────────────────────────────
const InvestorApplications = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [franchisesMap, setFranchisesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false); // ← triggers animations AFTER data loads

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1️⃣ Fetch investor's applications
        const appRes = await fetch(
          "http://localhost:5000/api/applications/my-applications",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!appRes.ok) return;
        const appsData = await appRes.json();
        setApplications(appsData);

        // 2️⃣ Fetch all franchises from MongoDB
        const frRes = await fetch("http://localhost:5000/api/franchises", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (frRes.ok) {
          const frData = await frRes.json();
          const map = {};
          frData.forEach((f) => { map[String(f._id)] = f; });
          setFranchisesMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        // Small delay so DOM is painted before animations fire
        setTimeout(() => setReady(true), 50);
      }
    };
    fetchAll();
  }, [token]);

  const submitted   = applications.length;
  const underReview = applications.filter((a) => a.status === "under_review").length;
  const approved    = applications.filter((a) => a.status === "approved").length;

  // Only keep apps where franchise exists in map
  const validApplications = applications.filter(
    (app) => franchisesMap[String(app.franchiseId)]
  );

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </motion.div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      {/* HEADING */}
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold"
      >
        Application Status
      </motion.h1>

      {/* STATUS SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Applications Submitted", value: submitted,   icon: <FiFileText    className="text-xl text-gray-600" /> },
          { label: "Under Review",            value: underReview, icon: <FiClock       className="text-xl text-gray-600" /> },
          { label: "Approved",                value: approved,    icon: <FiCheckCircle className="text-xl text-gray-600" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border flex justify-between items-start cursor-default"
          >
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1, type: "spring", stiffness: 200 }}
                className="text-2xl font-semibold mt-2"
              >
                {stat.value}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, rotate: -15 }}
              animate={ready ? { opacity: 1, rotate: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            >
              {stat.icon}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* APPLIED FRANCHISES */}
      <div className="space-y-4">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={ready ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-lg font-semibold"
        >
          Applied Franchises
        </motion.h2>

        <AnimatePresence mode="wait">
          {validApplications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-xl border p-12 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
              >
                <p className="text-gray-500">No applications yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start by browsing franchises in the marketplace
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {validApplications.map((app, index) => {
                const franchise = franchisesMap[String(app.franchiseId)];

                // ✅ Use local imageMap first, fallback to URL
                const imgSrc = imageMap[franchise.image]
                  || (franchise.image?.startsWith("http") ? franchise.image : null);

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={ready ? { opacity: 1, y: 0 } : {}}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.35 + index * 0.09 }}
                    whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
                    onClick={() => navigate(`/dashboard/investor/applications/${app._id}`)}
                    className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer"
                  >
                    {/* IMAGE */}
                    <div className="relative h-48 overflow-hidden group">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={franchise.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}

                      {/* INDUSTRY badge */}
                      <span className="absolute top-3 left-3 bg-white text-xs font-medium px-3 py-1 rounded-full shadow">
                        {franchise.industry}
                      </span>

                      {/* STATUS badge */}
                      <span className={`absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full shadow ${statusStyle(app.status)}`}>
                        {statusText(app.status)}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="p-4 space-y-1">
                      <h3 className="font-semibold">{franchise.name}</h3>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiMapPin size={14} />
                        {franchise.location || "Multiple Locations"}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiDollarSign size={14} />
                        Min. Invest: ₹{franchise.minInvestment?.toLocaleString()}
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InvestorApplications;