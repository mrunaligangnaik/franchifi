import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CheckCircle, XCircle, Star, DollarSign, User, Calendar,
  FileText, Eye, X, Mail, Phone, MapPin, Building2, MessageSquare, Send,
} from "lucide-react";
import { toast } from "react-toastify";

const FranchisorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/Franchisor/applications", {
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

  const updateStatus = async (id, status, remarks = "") => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/Franchisor/applications/${id}/status`,
        { status, remarks },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setApplications((prev) => prev.map((a) => (a._id === id ? res.data.application : a)));
      toast.success(`Application ${status} successfully!`);
      setShowModal(false);
      setSelectedApp(null);
      setRejectRemarks("");
      setShowRejectInput(false);
      fetchApplications();
    } catch (err) {
      console.error("Status update failed", err);
      toast.error("Failed to update application status");
    }
  };

  const handleRejectConfirm = (id) => {
    if (!showRejectInput) { setShowRejectInput(true); return; }
    updateStatus(id, "rejected", rejectRemarks);
  };

  const handleSendReply = async (applicationId) => {
    if (!replyText.trim()) { toast.error("Please write a reply first."); return; }
    setReplySending(true);
    try {
      await axios.post(
        `http://localhost:5000/api/Franchisor/applications/${applicationId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Reply sent! Investor will be notified instantly.");
      setSelectedApp((prev) => ({ ...prev, franchisorReply: replyText, franchisorReplyAt: new Date() }));
      setReplyText("");
      fetchApplications();
    } catch (err) {
      console.error("Reply failed", err);
      toast.error("Failed to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  const openApplicationDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
    setShowRejectInput(false);
    setRejectRemarks("");
    setReplyText("");
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const stats = {
    all: applications.length,
    submitted: applications.filter((a) => a.status === "submitted" || a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const renderModalActions = (app) => {
    const { _id, status } = app;

    if (status === "approved") {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex-1">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm font-semibold text-green-700">This application has already been approved</span>
          </div>
          <button onClick={() => { setShowModal(false); setSelectedApp(null); }} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">Close</button>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => updateStatus(_id, "shortlisted")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors">
            <Star className="w-5 h-5" /> Move to Shortlist
          </button>
        </div>
      );
    }

    if (status === "shortlisted") {
      return (
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => updateStatus(_id, "approved")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors">
            <CheckCircle className="w-5 h-5" /> Approve Application
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        <AnimatePresence>
          {showRejectInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full overflow-hidden"
            >
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                Rejection Reason <span className="text-gray-400">(optional but recommended)</span>
              </label>
              <textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Insufficient investment budget, location not available..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button onClick={() => updateStatus(_id, "approved")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors">
            <CheckCircle className="w-5 h-5" /> Approve
          </button>
          <button onClick={() => updateStatus(_id, "shortlisted")} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors">
            <Star className="w-5 h-5" /> Shortlist
          </button>
          <button
            onClick={() => handleRejectConfirm(_id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${showRejectInput ? "bg-red-700 hover:bg-red-800 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            <XCircle className="w-5 h-5" />
            {showRejectInput ? "Confirm Reject" : "Reject"}
          </button>
        </div>

        {showRejectInput && (
          <button onClick={() => { setShowRejectInput(false); setRejectRemarks(""); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center">
            Cancel rejection
          </button>
        )}
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
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
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
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-semibold text-blue-700">{filteredApplications.length} Applications</span>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 overflow-x-auto"
        >
          <FilterTab label="All"         count={stats.all}         active={filter === "all"}         onClick={() => setFilter("all")} />
          <FilterTab label="Submitted"   count={stats.submitted}   active={filter === "submitted"}   onClick={() => setFilter("submitted")} />
          <FilterTab label="Shortlisted" count={stats.shortlisted} active={filter === "shortlisted"} onClick={() => setFilter("shortlisted")} />
          <FilterTab label="Approved"    count={stats.approved}    active={filter === "approved"}    onClick={() => setFilter("approved")} />
          <FilterTab label="Rejected"    count={stats.rejected}    active={filter === "rejected"}    onClick={() => setFilter("rejected")} />
        </motion.div>

        {/* Table / Empty */}
        <AnimatePresence mode="wait">
          {filteredApplications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-sm text-gray-500">{filter === "all" ? "No applications submitted yet." : `No ${filter} applications.`}</p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Query</th>
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
                              <span className="text-white font-semibold text-sm">{app.investor?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{app.investor?.name || "Unknown Investor"}</p>
                            <p className="text-xs text-gray-500">{app.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{app.franchiseName || "Not Specified"}</p></td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-600">{new Date(app.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>{app.status.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        {app.investorQuery ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${app.franchisorReply ? "bg-green-50 border-green-200 text-green-600" : "bg-orange-50 border-orange-200 text-orange-600"}`}>
                            <MessageSquare className="w-3 h-3" />
                            {app.franchisorReply ? "Replied" : "Has Query"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status === "approved" ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2332] text-green-400 rounded-lg text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" /> Approved
                          </span>
                        ) : (
                          <motion.button
                            onClick={() => openApplicationDetails(app)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg font-medium text-sm transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View Application
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

        {/* Modal */}
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
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Application ID: {selectedApp._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <button onClick={() => { setShowModal(false); setSelectedApp(null); setShowRejectInput(false); setRejectRemarks(""); }} className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(selectedApp.status)}`}>Status: {selectedApp.status.toUpperCase()}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><User className="w-4 h-4" />Investor Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={selectedApp.investor?.name || "N/A"} />
                      <InfoRow label="Email" value={selectedApp.email || "N/A"} icon={<Mail className="w-4 h-4" />} />
                      <InfoRow label="Phone" value={selectedApp.phone || "N/A"} icon={<Phone className="w-4 h-4" />} />
                      <InfoRow label="City" value={selectedApp.city || "N/A"} icon={<MapPin className="w-4 h-4" />} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" />Franchise Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow label="Franchise Name" value={selectedApp.franchiseName || "N/A"} />
                      <InfoRow label="Investment Budget" value={selectedApp.investmentBudget || "N/A"} icon={<DollarSign className="w-4 h-4" />} />
                      <InfoRow label="Preferred Location" value={selectedApp.preferredLocation || "N/A"} />
                      <InfoRow label="Submitted On" value={new Date(selectedApp.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} icon={<Calendar className="w-4 h-4" />} />
                    </div>
                  </div>

                  {selectedApp.notes && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Additional Notes</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.notes}</p>
                    </div>
                  )}

                  {selectedApp.investorQuery && (
                    <div className="rounded-lg border border-orange-200 overflow-hidden">
                      <div className="bg-orange-50 p-6">
                        <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" />Investor Query About Rejection</h3>
                        <p className="text-sm text-orange-900 leading-relaxed italic">"{selectedApp.investorQuery}"</p>
                        <p className="text-xs text-orange-500 mt-2">Asked on {new Date(selectedApp.investorQueryAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      {selectedApp.franchisorReply ? (
                        <div className="bg-green-50 border-t border-green-200 p-6">
                          <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-2">✅ Your Reply (Sent)</h3>
                          <p className="text-sm text-green-800 italic">"{selectedApp.franchisorReply}"</p>
                          <p className="text-xs text-green-500 mt-1">Investor was notified in real-time via bell notification.</p>
                        </div>
                      ) : (
                        <div className="bg-white border-t border-orange-100 p-6">
                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2"><Send className="w-4 h-4" />Reply to Investor</h3>
                          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Explain your decision and what the investor can improve for future applications..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none mb-3" />
                          <button onClick={() => handleSendReply(selectedApp._id)} disabled={replySending} className="flex items-center gap-2 px-5 py-2 bg-[#1a2332] hover:bg-[#2a3442] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send className="w-4 h-4" />{replySending ? "Sending..." : "Send Reply to Investor"}
                          </button>
                          <p className="text-xs text-gray-400 mt-2">Investor will receive a real-time bell notification with your reply.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedApp.remarks && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Rejection Remarks</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6">
                  {renderModalActions(selectedApp)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const FilterTab = ({ label, count, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${active ? "bg-[#1a2332] text-white" : "text-gray-600 hover:bg-gray-100"}`}
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

export default FranchisorApplications;