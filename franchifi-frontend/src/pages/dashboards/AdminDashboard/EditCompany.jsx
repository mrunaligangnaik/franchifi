import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowLeft } from "lucide-react";
import { toast } from 'react-toastify';

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", description: "", industry: "", minInvestment: "",
    location: "", applicationFee: "", image: "", ownerName: "",
    status: "pending", isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => { fetchCompanyData(); }, [id]);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/franchises/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "", description: data.description || "", industry: data.industry || "",
          minInvestment: data.minInvestment || "", location: data.location || "",
          applicationFee: data.franchiseFee || data.applicationFee || "", image: data.image || "",
          ownerName: data.ownerName || "", status: data.status || "pending",
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else { toast.error("Failed to load company data"); navigate("/dashboard/admin/companies"); }
    } catch (err) { console.error(err); toast.error("Error loading company data"); navigate("/dashboard/admin/companies"); }
    finally { setFetchingData(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/franchises/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, minInvestment: Number(formData.minInvestment), applicationFee: Number(formData.applicationFee) })
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to update company"); setLoading(false); return; }
      toast.success("Company updated successfully!");
      setTimeout(() => { navigate("/dashboard/admin/companies"); }, 1500);
    } catch (err) { console.error("Error:", err); toast.error("Server error. Please try again."); setLoading(false); }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-900 mb-4"></div>
          <p className="text-gray-500">Loading company data...</p>
        </motion.div>
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
          <motion.button
            onClick={() => navigate("/dashboard/admin/companies")}
            whileHover={{ x: -3 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Companies</span>
          </motion.button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
          <p className="text-gray-500 mt-2">Update the company information below</p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Company Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter company name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name <span className="text-red-500">*</span></label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Enter owner name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry <span className="text-red-500">*</span></label>
                  <select name="industry" value={formData.industry} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none appearance-none bg-white">
                    <option value="">Select Industry</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Beauty & Salon">Beauty & Salon</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter location" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Filename</label>
                  <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="e.g., coffee.jpg" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Use: coffee.jpg, restaurant.jpg, retail.jpg, etc.</p>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Investment (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange} required placeholder="Enter minimum investment" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="applicationFee" value={formData.applicationFee} onChange={handleChange} required placeholder="Enter application fee" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Description</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Description <span className="text-red-500">*</span></label>
                <textarea name="description" rows="6" value={formData.description} onChange={handleChange} required placeholder="Provide a detailed description of the franchise opportunity..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none resize-none" />
              </div>
            </div>

            {/* Status */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Status & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none appearance-none bg-white">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-slate-700 border-gray-300 rounded focus:ring-2 focus:ring-slate-500 cursor-pointer" />
                    <span className="ml-3 text-sm font-medium text-gray-700">Mark as Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-6 border-t border-gray-200 flex gap-4">
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard/admin/companies")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <><Building2 className="w-5 h-5" />Update Company</>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditCompany;