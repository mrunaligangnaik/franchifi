import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Star, DollarSign, User, Calendar,
  FileText, Eye, X, Mail, Phone, MapPin, Building2, Trash2
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const Verification = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  const updateStatus = async (id, status, paymentStatus) => {
    if (status === "approved" && paymentStatus !== "paid") {
      toast.error("Cannot approve application without payment");
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/applications/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) => prev.map((a) => (a._id === id ? res.data : a)));
      toast.success(`Application ${status} successfully!`);
      setShowModal(false);
      setSelectedApp(null);
    } catch (err) {
      console.error("Status update failed", err);
      toast.error("Failed to update application status");
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((a) => a._id !== id));
      toast.success("Application deleted successfully!");
      setShowModal(false);
      setSelectedApp(null);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete application");
    }
  };

  const openApplicationDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted:  "bg-blue-50 text-blue-700 border-blue-200",
      approved:   "bg-green-50 text-green-700 border-green-200",
      rejected:   "bg-red-50 text-red-700 border-red-200",
      shortlisted:"bg-purple-50 text-purple-700 border-purple-200",
      pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const stats = {
    all:         applications.length,
    submitted:   applications.filter((a) => a.status === "submitted").length,
    approved:    applications.filter((a) => a.status === "approved").length,
    rejected:    applications.filter((a) => a.status === "rejected").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
  };

  const renderModalActions = (app) => {
    const { _id, status, paymentStatus } = app;

    if (status === "approved") {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex-1">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm font-semibold text-green-700">
              This application has already been approved
            </span>
          </div>
          <button
            onClick={() => { setShowModal(false); setSelectedApp(null); }}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="flex items-center gap-3 w-full">
          <motion.button
            onClick={() => deleteApplication(_id)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Delete Application
          </motion.button>
          <motion.button
            onClick={() => updateStatus(_id, "shortlisted", paymentStatus)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Star className="w-5 h-5" />
            Move to Shortlist
          </motion.button>
        </div>
      );
    }

    if (status === "shortlisted") {
      return (
        <div className="flex items-center gap-3 w-full">
          <motion.button
            disabled={paymentStatus !== "paid"}
            onClick={() => updateStatus(_id, "approved", paymentStatus)}
            whileHover={{ scale: paymentStatus === "paid" ? 1.03 : 1 }}
            whileTap={{ scale: paymentStatus === "paid" ? 0.97 : 1 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            Approve Application
          </motion.button>
          {paymentStatus !== "paid" && (
            <p className="text-xs text-orange-600 font-medium whitespace-nowrap">
              ⚠️ Payment required to approve
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 w-full">
        <motion.button
          disabled={paymentStatus !== "paid"}
          onClick={() => updateStatus(_id, "approved", paymentStatus)}
          whileHover={{ scale: paymentStatus === "paid" ? 1.03 : 1 }}
          whileTap={{ scale: paymentStatus === "paid" ? 0.97 : 1 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Approve
        </motion.button>
        <motion.button
          onClick={() => updateStatus(_id, "shortlisted", paymentStatus)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Star className="w-5 h-5" />
          Shortlist
        </motion.button>
        <motion.button
          onClick={() => updateStatus(_id, "rejected", paymentStatus)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <XCircle className="w-5 h-5" />
          Reject
        </motion.button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1a2332]"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage franchise applications</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <span className="text-sm font-semibold text-blue-700">{filteredApplications.length} Applications</span>
        </motion.div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 overflow-x-auto"
      >
        {[
          { label: "All",         count: stats.all,         key: "all"         },
          { label: "Submitted",   count: stats.submitted,   key: "submitted"   },
          { label: "Shortlisted", count: stats.shortlisted, key: "shortlisted" },
          { label: "Approved",    count: stats.approved,    key: "approved"    },
          { label: "Rejected",    count: stats.rejected,    key: "rejected"    },
        ].map(({ label, count, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
          >
            <FilterTab
              label={label}
              count={count}
              active={filter === key}
              onClick={() => setFilter(key)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Applications Table */}
      <AnimatePresence mode="wait">
        {filteredApplications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-sm text-gray-500">
              {filter === "all" ? "No applications submitted yet." : `No ${filter} applications.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Investor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Franchise</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app, i) => (
                  <motion.tr
                    key={app._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-[#1a2332] to-gray-600 flex items-center justify-center">
                          {app.investor?.avatar ? (
                            <img src={app.investor.avatar} alt={app.investor?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {app.investor?.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{app.investor?.name || "Unknown Investor"}</p>
                          <p className="text-xs text-gray-500">{app.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{app.franchiseName || "Not Specified"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === "approved" ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2332] text-green-400 rounded-lg text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </span>
                      ) : (
                        <motion.button
                          onClick={() => openApplicationDetails(app)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Application
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Details Modal */}
      <AnimatePresence>
        {showModal && selectedApp && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Application ID: {selectedApp._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <motion.button
                  onClick={() => { setShowModal(false); setSelectedApp(null); }}
                  whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                {/* Status Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(selectedApp.status)}`}>
                    Status: {selectedApp.status.toUpperCase()}
                  </span>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                    selectedApp.paymentStatus === "paid"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>
                    Payment: {selectedApp.paymentStatus === "paid" ? "PAID" : "PENDING"}
                  </span>
                </motion.div>

                {/* Investor Information */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Investor Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Full Name" value={selectedApp.investor?.name || "N/A"} />
                    <InfoRow label="Email"     value={selectedApp.email || "N/A"}           icon={<Mail    className="w-4 h-4" />} />
                    <InfoRow label="Phone"     value={selectedApp.phone || "N/A"}           icon={<Phone   className="w-4 h-4" />} />
                    <InfoRow label="City"      value={selectedApp.city  || "N/A"}           icon={<MapPin  className="w-4 h-4" />} />
                  </div>
                </motion.div>

                {/* Franchise Details */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.22 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Franchise Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Franchise Name"     value={selectedApp.franchiseName     || "N/A"} />
                    <InfoRow label="Investment Budget"  value={selectedApp.investmentBudget  || "N/A"} icon={<DollarSign className="w-4 h-4" />} />
                    <InfoRow label="Preferred Location" value={selectedApp.preferredLocation || "N/A"} />
                    <InfoRow
                      label="Submitted On"
                      value={new Date(selectedApp.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                  </div>
                </motion.div>

                {/* Payment Warning */}
                <AnimatePresence>
                  {selectedApp.paymentStatus !== "paid" && selectedApp.status !== "rejected" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <div className="text-orange-500 mt-0.5">⚠️</div>
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900">Payment Pending</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              This application cannot be approved until payment is confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Additional Notes */}
                {selectedApp.notes && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.28 }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Additional Notes</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.notes}</p>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6"
              >
                {renderModalActions(selectedApp)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Helper Components ──────────────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
      active ? "bg-[#1a2332] text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {label} {count > 0 && `(${count})`}
  </motion.button>
);

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="text-gray-400 mt-1">{icon}</div>}
    <div className="flex-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default Verification;