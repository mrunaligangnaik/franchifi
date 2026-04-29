import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const FranchiseApproval = () => {
  const [franchises, setFranchises] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/franchises", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFranchises(res.data))
      .catch(() => alert("Failed to load franchises"));
  }, [token]);

  const approve = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/admin/franchises/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFranchises((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, status: "approved", isActive: true } : f
      )
    );
  };

  const reject = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/admin/franchises/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFranchises((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, status: "rejected", isActive: false } : f
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="p-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold mb-4"
      >
        Franchise Approvals
      </motion.h2>

      <AnimatePresence>
        {franchises.map((f, i) => (
          <motion.div
            key={f._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="border p-4 mb-3 rounded"
          >
            <p><b>Name:</b> {f.name}</p>
            <p><b>Industry:</b> {f.industry}</p>
            <p><b>Status:</b> {f.status}</p>

            {f.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-2 flex gap-2"
              >
                <motion.button
                  onClick={() => approve(f._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </motion.button>
                <motion.button
                  onClick={() => reject(f._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default FranchiseApproval;