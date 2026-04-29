import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Save, AlertCircle } from "lucide-react";
import { toast } from 'react-toastify';
import axios from "axios";

const FranchisorCompany = () => {
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", industry: "", minInvestment: "",
    location: "", applicationFee: "", image: "", isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => { fetchMyFranchises(); }, []);

  const fetchMyFranchises = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/franchises/my/franchises", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFranchises(res.data);
      if (res.data.length > 0) selectFranchise(res.data[0]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your franchises");
    } finally {
      setFetchingData(false);
    }
  };

  const selectFranchise = (franchise) => {
    setSelectedFranchise(franchise);
    setFormData({
      name: franchise.name || "",
      description: franchise.description || "",
      industry: franchise.industry || "",
      minInvestment: franchise.minInvestment || "",
      location: franchise.location || "",
      applicationFee: franchise.franchiseFee || franchise.applicationFee || "",
      image: franchise.image || "",
      isActive: franchise.isActive !== undefined ? franchise.isActive : true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFranchise) { toast.error("No franchise selected"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/franchises/${selectedFranchise._id}`,
        { ...formData, minInvestment: Number(formData.minInvestment), applicationFee: Number(formData.applicationFee) },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      toast.success("Franchise updated successfully!");
      fetchMyFranchises();
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to update franchise");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
          <p className="text-gray-500">Loading your franchises...</p>
        </motion.div>
      </div>
    );
  }

  if (franchises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Franchises Found</h2>
            <p className="text-gray-500">You haven't created any franchises yet.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50 p-6 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Company</h1>
          <p className="text-gray-500 mt-2">Manage your franchise information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Franchises</h3>
              <div className="space-y-2">
                {franchises.map((franchise, i) => (
                  <motion.button
                    key={franchise._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectFranchise(franchise)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all relative ${
                      selectedFranchise?._id === franchise._id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{franchise.name}</p>
                    <p className="text-xs opacity-75 mt-1">{franchise.location}</p>
                    {franchise.isActive
                      ? <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
                      : <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Status Alerts */}
              <AnimatePresence>
                {selectedFranchise?.status === "pending" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Pending Approval</p>
                      <p className="text-xs text-yellow-700 mt-1">Your franchise is currently under review by the admin.</p>
                    </div>
                  </motion.div>
                )}
                {selectedFranchise?.status === "approved" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Approved & Active</p>
                      <p className="text-xs text-green-700 mt-1">Your franchise is approved and ready for investors.</p>
                    </div>
                  </motion.div>
                )}
                {!formData.isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Franchise Inactive</p>
                      <p className="text-xs text-red-700 mt-1">This franchise is currently hidden from the marketplace.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Franchise Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Franchise Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Franchise Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter franchise name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry <span className="text-red-500">*</span></label>
                      <select name="industry" value={formData.industry} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none appearance-none bg-white">
                        <option value="">Select Industry</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Retail">Retail</option>
                        <option value="Education">Education</option>
                        <option value="Health & Fitness">Health & Fitness</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Beauty & Wellness">Beauty & Wellness</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter location" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image Filename</label>
                      <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="e.g., coffee.jpg" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                      <p className="text-xs text-gray-500 mt-1">Use: coffee.jpg, restaurant.jpg, retail.jpg, fitness.jpg, etc.</p>
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Investment (₹) <span className="text-red-500">*</span></label>
                      <input type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange} required placeholder="Enter minimum investment" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee (₹) <span className="text-red-500">*</span></label>
                      <input type="number" name="applicationFee" value={formData.applicationFee} onChange={handleChange} required placeholder="Enter application fee" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Description</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Franchise Description <span className="text-red-500">*</span></label>
                    <textarea name="description" rows="6" value={formData.description} onChange={handleChange} required placeholder="Provide a detailed description of your franchise opportunity..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none resize-none" />
                  </div>
                </div>

                {/* Availability */}
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability Settings</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active in Marketplace</p>
                      <p className="text-xs text-gray-500 mt-1">{formData.isActive ? "Your franchise is visible to investors" : "Your franchise is hidden from investors"}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-gray-200">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      <><Save className="w-5 h-5" />Save Changes</>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FranchisorCompany;