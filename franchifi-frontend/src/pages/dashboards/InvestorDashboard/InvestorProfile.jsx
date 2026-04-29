import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

axios.defaults.baseURL = "http://localhost:5000";

const InvestorProfile = () => {
  const { token, logout, user, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", avatar: "",
    gender: "", birthday: "", role: "investor"
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      gender: user.gender || "",
      birthday: user.birthday ? user.birthday.split("T")[0] : "",
      role: user.role || "investor"
    });
    setAvatarPreview(user.avatar || null);
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("gender", form.gender);
      formData.append("role", "investor");
      if (form.birthday) formData.append("birthday", form.birthday);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.put("/api/auth/me", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      updateUser(res.data);
      setAvatarPreview(res.data.avatar || null);
      setEdit(false);
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (authLoading || !user)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.loading}
      >
        Loading...
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={styles.container}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={styles.card}
      >
        {/* ── Avatar ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={styles.profileHeader}
        >
          <div style={styles.avatarWrapper}>
            <motion.img
              key={avatarPreview}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              src={avatarPreview ?? user.avatar ?? "/default-avatar.png"}
              alt="profile"
              style={styles.avatar}
            />

            <AnimatePresence>
              {edit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                >
                  <label htmlFor="avatar-upload" style={styles.editIconLabel}>
                    <div style={styles.editIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Name ── */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          style={styles.name}
        >
          {edit ? (
            <input
              style={styles.nameInput}
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          ) : (
            user.name
          )}
        </motion.h1>

        {/* ── Contact Information ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={styles.section}
        >
          <h3 style={styles.sectionTitle}>CONTACT INFORMATION</h3>
          <div style={styles.infoRow}>
            <span style={styles.label}>Role:</span>
            <span style={styles.value}>{user.role || "investor"}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email id:</span>
            <span style={styles.value}>{user.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Phone:</span>
            {edit ? (
              <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
            ) : (
              <span style={styles.valueLink}>{user.phone || "-"}</span>
            )}
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Address:</span>
            {edit ? (
              <input style={styles.input} name="address" value={form.address} onChange={handleChange} placeholder="Enter address" />
            ) : (
              <span style={styles.value}>{user.address || "-"}</span>
            )}
          </div>
        </motion.div>

        {/* ── Basic Information ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.33 }}
          style={styles.section}
        >
          <h3 style={styles.sectionTitle}>BASIC INFORMATION</h3>
          <div style={styles.infoRow}>
            <span style={styles.label}>Gender:</span>
            {edit ? (
              <select style={styles.input} name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <span style={styles.value}>{user.gender || "-"}</span>
            )}
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Birthday:</span>
            {edit ? (
              <input style={styles.input} type="date" name="birthday" value={form.birthday} onChange={handleChange} />
            ) : (
              <span style={styles.value}>
                {user.birthday
                  ? new Date(user.birthday).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                  : "-"}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={styles.buttonGroup}
        >
          <AnimatePresence mode="wait">
            {!edit ? (
              <motion.div
                key="view-btns"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", gap: "15px", flex: 1 }}
              >
                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#5B9BD5", color: "white" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  style={styles.editButton}
                  onClick={() => setEdit(true)}
                >
                  Edit
                </motion.button>

                {/* Logout Button — red on hover */}
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" }}
                  whileTap={{ scale: 0.97, backgroundColor: "#dc2626", color: "white", borderColor: "#dc2626" }}
                  transition={{ duration: 0.2 }}
                  style={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="edit-btns"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", gap: "15px", flex: 1 }}
              >
                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.03, backgroundColor: "#5B9BD5", color: "white" }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  transition={{ duration: 0.2 }}
                  style={{ ...styles.editButton, opacity: loading ? 0.6 : 1 }}
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save information"}
                </motion.button>

                {/* Cancel Button */}
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6", borderColor: "#aaa" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  style={styles.cancelButton}
                  onClick={() => {
                    setEdit(false);
                    setAvatarFile(null);
                    setAvatarPreview(user.avatar || null);
                    setForm({
                      name: user.name || "",
                      phone: user.phone || "",
                      address: user.address || "",
                      avatar: user.avatar || "",
                      gender: user.gender || "",
                      birthday: user.birthday ? user.birthday.split("T")[0] : "",
                      role: user.role || "investor"
                    });
                  }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666"
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  profileHeader: {
    textAlign: "center",
    marginBottom: "20px"
  },
  avatarWrapper: {
    position: "relative",
    display: "inline-block"
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #f0f0f0"
  },
  editIcon: {
    backgroundColor: "#5B9BD5",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    border: "3px solid white",
    transition: "all 0.3s ease"
  },
  editIconLabel: {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    cursor: "pointer"
  },
  name: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "30px",
    textAlign: "center"
  },
  nameInput: {
    fontSize: "32px",
    fontWeight: "600",
    border: "none",
    borderBottom: "2px solid #4CAF50",
    outline: "none",
    textAlign: "center",
    width: "100%",
    padding: "5px"
  },
  section: {
    marginBottom: "35px",
    borderTop: "1px solid #e0e0e0",
    paddingTop: "20px"
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    letterSpacing: "0.5px",
    marginBottom: "20px",
    textTransform: "uppercase"
  },
  infoRow: {
    display: "flex",
    marginBottom: "16px",
    alignItems: "center"
  },
  label: {
    fontSize: "16px",
    color: "#666",
    minWidth: "120px",
    fontWeight: "400"
  },
  value: {
    fontSize: "16px",
    color: "#333",
    flex: 1
  },
  valueLink: {
    fontSize: "16px",
    color: "#5B9BD5",
    flex: 1,
    textDecoration: "none"
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s"
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "30px"
  },
  editButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "white",
    color: "#5B9BD5",
    border: "2px solid #5B9BD5",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none"
  },
  logoutButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "white",
    color: "#666",
    border: "2px solid #ddd",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none"
  },
  cancelButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "white",
    color: "#666",
    border: "2px solid #ddd",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none"
  },
};

export default InvestorProfile;