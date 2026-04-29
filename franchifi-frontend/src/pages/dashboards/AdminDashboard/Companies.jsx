import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiDollarSign, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { coffee, restaurant, retail, fitness, beauty, education, automotive } from '../../../assets';

const Companies = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const imageMap = {
    "coffee.jpg": coffee, "restaurant.jpg": restaurant, "retail.jpg": retail,
    "fitness.jpg": fitness, "beauty.jpg": beauty, "education.jpg": education, "automotive.jpg": automotive,
  };

  const getIndustryColor = (industry) => {
    const colorMap = {
      'Food & Beverage': '#10b981', 'Retail': '#3b82f6', 'Education': '#f59e0b',
      'Healthcare': '#ef4444', 'Fitness': '#8b5cf6', 'Beauty & Salon': '#ec4899',
      'Automotive': '#6366f1', 'Real Estate': '#14b8a6', 'Technology': '#06b6d4', 'Other': '#6b7280'
    };
    return colorMap[industry] || '#94a3b8';
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/franchises", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      let franchiseData = [];
      if (Array.isArray(data)) franchiseData = data;
      else if (data.franchises) franchiseData = data.franchises;
      setCompanies(franchiseData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/franchises/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success('Company deleted successfully!'); fetchCompanies(); }
      else { const data = await res.json(); toast.error(data.message || 'Failed to delete company'); }
    } catch (err) { console.error(err); toast.error('Error deleting company'); }
  };

  const filteredCompanies = companies.filter((c) => {
    const status = c.status === "approved" && c.isActive ? "active" : c.status === "pending" ? "pending" : "inactive";
    return (activeTab === 'all' || status === activeTab) && c.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies Management</h1>
            <p className="text-gray-500 mt-1">Manage and monitor all franchise companies</p>
          </div>
          <motion.button
            onClick={() => navigate("/dashboard/admin/add-company")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Company
          </motion.button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
          </div>
          <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {['all', 'active', 'pending', 'inactive'].map(tab => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Companies Grid */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-900"></div>
          <p className="text-gray-500 mt-4">Loading companies...</p>
        </motion.div>
      ) : filteredCompanies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-xl border border-gray-200 p-20 text-center"
        >
          <p className="text-gray-500 text-lg">No companies found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCompanies.map((company, index) => {
              const status = company.status === "approved" && company.isActive ? "active" : company.status === "pending" ? "pending" : "inactive";
              return (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.10)" }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-48 bg-gray-100 group">
                    <img
                      src={imageMap[company.image] || company.image || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="${getIndustryColor(company.industry)}"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="48" font-weight="bold">${company.industry || 'CO'}</text></svg>`}
                      alt={company.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${status === 'active' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {status.toUpperCase()}
                    </span>
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                      {company.industry || 'N/A'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{company.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="text-gray-400 shrink-0" />
                        <span className="truncate">{company.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiDollarSign className="text-gray-400 shrink-0" />
                        <span>Min. Invest: ₹{company.minInvestment?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Owner:</span> {company.ownerName || company.owner?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">Joined: {new Date(company.createdAt).toLocaleDateString()}</div>
                    </div>
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                    )}
                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => navigate(`/dashboard/admin/edit-company/${company._id}`)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <FiEye className="w-4 h-4" /> Edit Company
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(company._id, company.name)}
                        whileHover={{ scale: 1.08, backgroundColor: "#fee2e2" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-all"
                        title="Delete Company"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export default Companies;