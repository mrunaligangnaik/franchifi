import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiCamera } from "react-icons/fi";
import { toast } from "react-toastify";

const FranchisorProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", gender: "", birthday: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setAvatarPreview(res.data.avatar || null);
      setFormData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        gender: res.data.gender || "",
        birthday: res.data.birthday ? res.data.birthday.split("T")[0] : "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("gender", formData.gender);
      if (formData.birthday) formDataToSend.append("birthday", formData.birthday);
      if (avatarFile) formDataToSend.append("avatar", avatarFile);

      const res = await axios.put("http://localhost:5000/api/auth/me", formDataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setAvatarPreview(res.data.avatar || null);
      localStorage.setItem("user", JSON.stringify(res.data));
      setEditing(false);
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
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
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="p-8 bg-linear-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <motion.div
                    key={avatarPreview}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    {avatarPreview || user?.avatar ? (
                      <img src={avatarPreview || user?.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white/20" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20">
                        <span className="text-white font-bold text-3xl">{user?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.25 }}
                        className="absolute bottom-0 right-0"
                      >
                        <label htmlFor="avatar-upload" className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                          <FiCamera className="w-4 h-4 text-gray-700" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  <p className="text-gray-300 mt-1">{user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">Franchisor</span>
                </motion.div>
              </div>

              <motion.button
                onClick={() => { if (editing) { setAvatarFile(null); setAvatarPreview(user?.avatar || null); } setEditing(!editing); }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                {editing ? "Cancel" : "Edit Profile"}
              </motion.button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                        <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="3" placeholder="Enter your address" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all resize-none" />
                      </div>
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Save Changes
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: <FiMail />, label: "Email Address", value: user?.email },
                        { icon: <FiPhone />, label: "Phone Number", value: user?.phone || "Not provided" },
                        { icon: <FiMapPin />, label: "Address", value: user?.address || "Not provided", fullWidth: true },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.07 }}
                        >
                          <InfoCard icon={item.icon} label={item.label} value={item.value} fullWidth={item.fullWidth} />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: <FiUser />, label: "Full Name", value: user?.name || "Not provided" },
                        { icon: <FiUser />, label: "Gender", value: user?.gender || "Not provided" },
                        {
                          icon: <FiCalendar />, label: "Birthday",
                          value: user?.birthday ? new Date(user.birthday).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Not provided"
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
                        >
                          <InfoCard icon={item.icon} label={item.label} value={item.value} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const InfoCard = ({ icon, label, value, fullWidth }) => (
  <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${fullWidth ? "md:col-span-2" : ""}`}>
    <div className="flex items-center gap-2 mb-2 text-gray-500">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-gray-900 font-medium text-sm">{value}</p>
  </div>
);

export default FranchisorProfile;