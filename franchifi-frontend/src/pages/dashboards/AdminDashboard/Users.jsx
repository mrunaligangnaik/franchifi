import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Eye, X, UserCheck, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { const data = await response.json(); setUsers(data.users); setFilteredUsers(data.users); }
    } catch (error) { console.error('Error fetching users:', error); toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredUsers(filtered);
    } else { setFilteredUsers(users); }
  }, [searchTerm, users]);

  const viewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { const data = await response.json(); setSelectedUser(data); setShowModal(true); }
      else { toast.error('Failed to load user details'); }
    } catch (error) { console.error('Error fetching user details:', error); toast.error('Error loading user details'); }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.ok) { fetchUsers(); setDeleteConfirm(null); toast.success('User deleted successfully'); }
      else { toast.error('Failed to delete user'); }
    } catch (error) { console.error('Error deleting user:', error); toast.error('Failed to delete user'); }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:5000/${avatar.replace(/^\//, '')}`;
  };

  const getRoleBadge = (role) => {
    const colors = { admin: { bg: '#ede9fe', text: '#7c3aed' }, franchisee: { bg: '#dbeafe', text: '#2563eb' }, investor: { bg: '#d1fae5', text: '#059669' }, user: { bg: '#f1f5f9', text: '#64748b' } };
    const c = colors[role] || colors.user;
    return { background: c.bg, color: c.text, padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'capitalize' };
  };

  const getStatusBadge = (status) => {
    const colors = { active: { bg: '#d1fae5', text: '#059669' }, inactive: { bg: '#fee2e2', text: '#dc2626' }, pending: { bg: '#fef3c7', text: '#d97706' } };
    const c = colors[status] || colors.active;
    return { background: c.bg, color: c.text, padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'capitalize' };
  };

  const UserAvatar = ({ user, size = 40 }) => {
    const avatarUrl = getAvatarUrl(user?.avatar || user?.profileImage);
    const [imgError, setImgError] = useState(false);
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: size > 50 ? '1.75rem' : '1rem', overflow: 'hidden' }}>
        {avatarUrl && !imgError ? (
          <img src={avatarUrl} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
        ) : (user?.name?.charAt(0)?.toUpperCase() || '?')}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      <style>{`.btn-action:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .btn-close:hover { background: #e2e8f0 !important; } .btn-cancel:hover { background: #f8fafc !important; } .btn-delete:hover { background: #dc2626 !important; }`}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Users Management</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Manage all registered users and their applications</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '500px' }}
      >
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', backgroundColor: 'white' }}
          type="text" placeholder="Search by name or email..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users',  value: users.length,                                       bg: '#f1f5f9', color: '#475569', idx: 0 },
          { label: 'Active Users', value: users.filter(u => u.status === 'active').length,    bg: '#d1fae5', color: '#059669', idx: 1 },
          { label: 'Pending',      value: users.filter(u => u.status === 'pending').length,   bg: '#fef3c7', color: '#d97706', idx: 2 },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + stat.idx * 0.08 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: stat.bg, color: stat.color }}>
              {stat.idx === 2 ? <Clock size={28} strokeWidth={2} /> : <UserCheck size={28} strokeWidth={2} />}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>{stat.label}</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: 0 }}
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading users...</motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                {['NAME', 'EMAIL', 'ROLE', 'STATUS', 'APPLICATIONS', 'REGISTERED', 'ACTIONS'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No users found</td></tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '1rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserAvatar user={user} />
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#334155' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}><span style={getRoleBadge(user.role)}>{user.role}</span></td>
                    <td style={{ padding: '1rem' }}><span style={getStatusBadge(user.status)}>{user.status}</span></td>
                    <td style={{ padding: '1rem', color: '#334155' }}>{user.applicationCount || 0} applications</td>
                    <td style={{ padding: '1rem', color: '#334155' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-action" style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                          onClick={() => viewUserDetails(user._id)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                          <Eye size={16} />
                        </button>
                        <button className="btn-action" style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                          onClick={() => setDeleteConfirm(user._id)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            key="user-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ background: 'white', borderRadius: '16px', maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>User Details</h2>
                <button className="btn-close" style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <UserAvatar user={selectedUser} size={72} />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{selectedUser.name}</h3>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>{selectedUser.email}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={getRoleBadge(selectedUser.role)}>{selectedUser.role}</span>
                      <span style={getStatusBadge(selectedUser.status)}>{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '1rem' }}>Personal Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { label: 'Full Name', value: selectedUser.name || 'N/A' },
                      { label: 'Email Address', value: selectedUser.email || 'N/A' },
                      { label: 'Phone', value: selectedUser.phone || 'N/A' },
                      { label: 'City', value: selectedUser.city || 'N/A' },
                      { label: 'Registered On', value: new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                      { label: 'Total Applications', value: `${selectedUser.applications?.length || selectedUser.applicationCount || 0} applications` }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                        <span style={{ fontSize: '0.95rem', color: '#1e293b' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedUser.applications && selectedUser.applications.length > 0 ? (
                  <div>
                    <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '1rem' }}>Franchise Applications ({selectedUser.applications.length})</h3>
                    {selectedUser.applications.map((app, i) => (
                      <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>{app.franchiseName || 'Not Specified'}</h4>
                          <span style={getStatusBadge(app.status)}>{app.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {app.investmentAmount && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}><strong>Investment:</strong> ₹{app.investmentAmount?.toLocaleString()}</p>}
                          {app.investmentBudget && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}><strong>Budget:</strong> {app.investmentBudget}</p>}
                          {app.preferredLocation && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}><strong>Location:</strong> {app.preferredLocation}</p>}
                          {(app.submittedAt || app.createdAt) && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}><strong>Applied:</strong> {new Date(app.submittedAt || app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                          {app.paymentStatus && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}><strong>Payment:</strong> <span style={{ color: app.paymentStatus === 'paid' ? '#059669' : '#d97706', fontWeight: '600', textTransform: 'uppercase' }}>{app.paymentStatus}</span></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.875rem' }}>No franchise applications submitted yet.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            key="delete-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ background: 'white', borderRadius: '16px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>Confirm Delete</h2>
                <button className="btn-close" style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Are you sure you want to delete this user? This action cannot be undone and the user will be notified.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-cancel" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', transition: 'all 0.2s' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  <button className="btn-delete" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', border: 'none', background: '#ef4444', color: 'white', transition: 'all 0.2s' }} onClick={() => handleDelete(deleteConfirm)}>Delete User</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;