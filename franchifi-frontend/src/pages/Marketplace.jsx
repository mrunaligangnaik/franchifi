import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiMapPin, FiDollarSign } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ ADDED
import {
  coffee,
  restaurant,
  retail,
  fitness,
  beauty,
  education,
  automotive,
} from "../assets";

const Marketplace = ({ appliedFranchiseIds = [] }) => {
  const [category, setCategory] = useState("");
  const [range, setRange] = useState("");
  const [localAppliedIds, setLocalAppliedIds] = useState([]);
  const [franchises, setFranchises] = useState([]);

  const { user, token } = useAuth(); // ✅ ADDED

  const imageMap = {
    "coffee.jpg": coffee,
    "restaurant.jpg": restaurant,
    "retail.jpg": retail,
    "fitness.jpg": fitness,
    "beauty.jpg": beauty,
    "education.jpg": education,
    "automotive.jpg": automotive,
  };

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5000/api/applications/my-applications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const ids = res.data.map((app) => String(app.franchiseId));
        console.log("Applied franchise IDs:", ids);
        setLocalAppliedIds(ids);
      } catch (err) {
        console.log("Not logged in or failed to fetch applications");
        setLocalAppliedIds([]);
      }
    };

    fetchApplied();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const clearFilters = () => {
    setCategory("");
    setRange("");
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/franchises")
      .then((res) => {
        console.log("Franchises from DB:", res.data);
        setFranchises(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch franchises", err);
      });
  }, []);

  // ✅ COMBINE BOTH APPLIED IDS
  const allAppliedIds = [...new Set([...appliedFranchiseIds, ...localAppliedIds])];

  const filteredFranchises = franchises.filter((f) => {
    // ✅ HIDE ALREADY APPLIED FRANCHISES
    if (allAppliedIds.includes(String(f._id))) {
      console.log(`Hiding franchise ${f._id} - already applied`);
      return false;
    }

    // Filter by category
    if (category && f.industry !== category) return false;

    // Filter by investment range
    if (range === "<10k" && f.minInvestment >= 10000) return false;
    if (range === "10-50" && (f.minInvestment < 10000 || f.minInvestment > 50000)) return false;
    if (range === "50-100" && (f.minInvestment < 50000 || f.minInvestment > 100000)) return false;
    if (range === "100+" && f.minInvestment < 100000) return false;

    return true;
  });

  const handleViewDetails = (id) => {
    const isDashboard = location.pathname.startsWith("/dashboard");

    if (isDashboard) {
      // ✅ User is inside dashboard — go to dashboard franchise detail
      navigate(`/dashboard/investor/franchise/${id}`);
    } else if (!token || !user) {
      // ✅ NOT logged in — redirect to register with redirectTo so after
      //    register/login they land back on the franchise detail page
      navigate("/register", {
        state: { redirectTo: `/franchise/${id}` },
      });
    } else {
      // ✅ Logged in, public marketplace — go to franchise detail
      navigate(`/franchise/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-64 bg-white border-r p-6 text-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiFilter />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <AnimatePresence>
            {(category || range) && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={clearFilters}
                className="text-xs text-red-400 flex items-center gap-1 hover:text-red-600 transition"
              >
                <FiX /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* CATEGORY */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs font-semibold text-gray-500 mb-3">CATEGORY</p>
          {[
            "Food & Beverage",
            "Retail",
            "Education",
            "Health & Fitness",
            "Automotive",
            "Beauty & Wellness",
          ].map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 mb-2 text-gray-700 cursor-pointer hover:text-black transition"
            >
              <input
                type="checkbox"
                checked={category === cat}
                onChange={() => setCategory(category === cat ? "" : cat)}
              />
              {cat}
            </label>
          ))}
        </motion.div>

        {/* INVESTMENT RANGE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-xs font-semibold text-gray-500 mb-3">INVESTMENT RANGE</p>
          {[
            { label: "< ₹10k", value: "<10k" },
            { label: "₹10k - ₹50k", value: "10-50" },
            { label: "₹50k - ₹1L", value: "50-100" },
            { label: "₹1L+", value: "100+" },
          ].map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-2 mb-2 text-gray-700 cursor-pointer hover:text-black transition"
            >
              <input
                type="radio"
                name="range"
                checked={range === r.value}
                onChange={() => setRange(r.value)}
              />
              {r.label}
            </label>
          ))}
        </motion.div>

        {/* LOCATION */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <p className="text-xs font-semibold text-gray-500 mb-3">LOCATION</p>
          <input
            type="text"
            placeholder="Enter City or State"
            className="w-full bg-gray-800 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-gray-600 transition"
          />
        </motion.div>
      </motion.aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <motion.h2
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-lg font-semibold mb-4"
        >
          Available Franchises ({filteredFranchises.length})
        </motion.h2>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFranchises.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, delay: index * 0.07 }}
                whileHover={{ y: -8, boxShadow: "0 12px 36px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <motion.img
                    src={imageMap[item.image] || item.image}
                    alt={item.name}
                    className="h-40 w-full object-cover"
                    whileHover={{ scale: 1.07 }}
                    transition={{ duration: 0.45 }}
                  />

                  <span className="absolute top-3 left-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {item.industry}
                  </span>
                </div>

                <div className="p-4 text-sm">
                  <h3 className="font-semibold">{item.name}</h3>

                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <FiMapPin className="text-gray-400" />
                    {item.location || "Multiple Locations"}
                  </p>

                  <p className="text-gray-600 mt-1 flex items-center gap-1">
                    <FiDollarSign className="text-gray-400" />
                    Min. Invest: ₹{item.minInvestment.toLocaleString()}
                  </p>

                  <p className="text-gray-500 mt-1 text-xs">
                    Application Fee: ₹{item.franchiseFee || 500}
                  </p>

                  <motion.button
                    onClick={() => handleViewDetails(item._id)}
                    whileHover={{ backgroundColor: "#000", color: "#fff" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 block w-full py-2 rounded text-xs bg-white text-black border border-gray-300 hover:bg-black hover:text-white transition cursor-pointer"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Marketplace;