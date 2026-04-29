import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle, FiClock, FiUser, FiMail, FiPhone,
  FiMapPin, FiDollarSign, FiBriefcase, FiArrowLeft,
  FiMessageSquare, FiSend,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvestorApplicationView = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showQueryBox, setShowQueryBox] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [querySending, setQuerySending] = useState(false);
  const [querySent, setQuerySent] = useState(false);

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("✅ Razorpay loaded");
    script.onerror = () => console.error("❌ Razorpay failed to load");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/applications/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplication(res.data);
        if (res.data.investorQuery) {
          setQuerySent(true);
          setQueryText(res.data.investorQuery);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);

  const handleSendQuery = async () => {
    if (!queryText.trim()) { toast.error("Please write your question first."); return; }
    setQuerySending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/applications/${applicationId}/ask-rejection-reason`,
        { question: queryText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuerySent(true);
      setShowQueryBox(false);
      toast.success("Your query has been sent to the franchisor and admin!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send query. Please try again.");
    } finally {
      setQuerySending(false);
    }
  };

  const handlePayNow = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/payments/create-order`,
        { applicationId: application._id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const { orderId, key, amount, currency } = res.data;
      const options = {
        key, amount, currency, order_id: orderId,
        name: "FranchiFi", description: "Franchise Application Fee",
        handler: async function (response) { await verifyPayment(response); },
        modal: { ondismiss: function () { setPaymentLoading(false); } },
        theme: { color: "#000000" },
      };
      if (!window.Razorpay) { toast.error("Payment SDK not loaded. Please refresh and try again."); setPaymentLoading(false); return; }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/payments/verify",
        {
          applicationId: application._id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        toast.success("Payment successful! Application submitted.", { position: "top-right", autoClose: 3000 });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading application...</p>
        </motion.div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Not Found</h2>
          <p className="text-gray-500 mb-6">The application you're looking for doesn't exist.</p>
          <motion.button
            onClick={() => navigate("/dashboard/investor/applications")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Applications
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":    return "bg-green-100 text-green-700";
      case "pending":     return "bg-yellow-100 text-yellow-700";
      case "rejected":    return "bg-red-100 text-red-700";
      case "shortlisted": return "bg-purple-100 text-purple-700";
      case "draft":       return "bg-gray-100 text-gray-700";
      default:            return "bg-blue-100 text-blue-700";
    }
  };

  const getPaymentStatusColor = (status) =>
    status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";

  const isRejected = application.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <ToastContainer />
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/dashboard/investor/applications")}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Applications</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-linear-to-r from-gray-900 to-gray-700 px-8 py-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Application Details</h1>
                <p className="text-gray-300 text-sm">Application ID: {applicationId}</p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="flex gap-3"
              >
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                  {application.status || "submitted"}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(application.paymentStatus)}`}>
                  {application.paymentStatus}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Rejection Banner */}
          <AnimatePresence>
            {isRejected && (
              <motion.div
                key="rejection-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 border-l-4 border-red-400 p-6 m-8 mb-0 rounded-lg">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xl">❌</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-red-800 mb-1">Application Rejected</h3>
                        {application.remarks ? (
                          <p className="text-sm text-red-700"><span className="font-medium">Reason: </span>{application.remarks}</p>
                        ) : (
                          <p className="text-sm text-red-600">No reason was provided. You can ask the franchisor for more details.</p>
                        )}
                      </div>
                    </div>

                    {!querySent && (
                      <motion.button
                        onClick={() => setShowQueryBox(!showQueryBox)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Ask Why Rejected
                      </motion.button>
                    )}
                  </div>

                  {/* Query sent confirmation */}
                  <AnimatePresence>
                    {querySent && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
                      >
                        <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Query sent successfully!</p>
                          <p className="text-xs text-green-600 mt-0.5 italic">"{queryText}"</p>
                          <p className="text-xs text-green-500 mt-1">The franchisor and admin have been notified. They will review your query.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Query textarea */}
                  <AnimatePresence>
                    {showQueryBox && !querySent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          <label className="text-xs font-semibold text-red-700 uppercase tracking-wide block">
                            Your Question to Franchisor / Admin
                          </label>
                          <textarea
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            placeholder="e.g. Why was my application rejected? What can I improve to get approved?"
                            rows={3}
                            className="w-full border border-red-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                          />
                          <div className="flex gap-2">
                            <motion.button
                              onClick={handleSendQuery}
                              disabled={querySending}
                              whileHover={{ scale: querySending ? 1 : 1.03 }}
                              whileTap={{ scale: querySending ? 1 : 0.97 }}
                              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiSend className="w-4 h-4" />
                              {querySending ? "Sending..." : "Send Query"}
                            </motion.button>
                            <motion.button
                              onClick={() => { setShowQueryBox(false); setQueryText(""); }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Pending Alert */}
          <AnimatePresence>
            {application.paymentStatus === "pending" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 m-8">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <FiClock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">Payment Pending</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Your application payment is pending. Please complete the payment to submit your application.</p>
                      </div>
                      <div className="mt-4">
                        <motion.button
                          onClick={handlePayNow}
                          disabled={paymentLoading}
                          whileHover={{ scale: paymentLoading ? 1 : 1.04 }}
                          whileTap={{ scale: paymentLoading ? 1 : 0.96 }}
                          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentLoading ? "Processing..." : "Pay Now - ₹500"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    {[
                      { icon: <FiUser />,   label: "Full Name", value: application.fullName },
                      { icon: <FiMail />,   label: "Email",     value: application.email    },
                      { icon: <FiPhone />,  label: "Phone",     value: application.phone    },
                      { icon: <FiMapPin />, label: "City",      value: application.city     },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.25 + i * 0.07 }}
                      >
                        <InfoItem icon={item.icon} label={item.label} value={item.value} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Business Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5" />
                    Business Information
                  </h2>
                  <div className="space-y-4">
                    {[
                      { icon: <FiDollarSign />, label: "Investment Budget",  value: application.investmentBudget                   },
                      { icon: <FiBriefcase />,  label: "Industry Experience",value: application.industryExperience || "N/A"        },
                      { icon: <FiMapPin />,     label: "Preferred Location", value: application.preferredLocation                  },
                      { icon: <FiClock />,      label: "Start Timeline",     value: application.startTimeline || "N/A"             },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.25 + i * 0.07 }}
                      >
                        <InfoItem icon={item.icon} label={item.label} value={item.value} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {application.experienceDescription && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="mt-8 pt-8 border-t border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience Description</h2>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {application.experienceDescription}
                </p>
              </motion.div>
            )}

            {application.additionalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h2>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {application.additionalInfo}
                </p>
              </motion.div>
            )}

            {/* Application Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-8 pt-8 border-t border-gray-200"
            >
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Franchise ID:</span>
                    <span className="font-medium text-gray-900">{application.franchiseId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${application.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                      {application.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Status:</span>
                    <span className="font-medium text-gray-900">{application.status || "submitted"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted On:</span>
                    <span className="font-medium text-gray-900">
                      {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-8 flex gap-4"
            >
              <motion.button
                onClick={() => navigate("/dashboard/investor/marketplace")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Browse Franchises
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-gray-400">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "N/A"}</p>
    </div>
  </div>
);

export default InvestorApplicationView;