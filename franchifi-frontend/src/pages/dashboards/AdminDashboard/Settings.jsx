import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings2, ChevronRight, Check, Save,
  Eye, EyeOff, AlertCircle, Bell, Lock
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const THEME = '#1a2332';
  const THEME_HOVER = '#2a3442';
  const BG_COLOR = '#f5f7fa';
  const CARD_BG = 'white';
  const TEXT_PRIMARY = '#1e293b';
  const TEXT_SECONDARY = '#6b7280';
  const BORDER_COLOR = '#e5e7eb';
  const INPUT_BG = 'white';

  const [profile, setProfile] = useState({ fullName: 'Admin User', email: 'admin@franchifi.com', currentPassword: '', newPassword: '' });
  const [platform, setPlatform] = useState({ platformName: 'FranchiFi', supportEmail: 'support@franchifi.com', defaultCurrency: 'INR', defaultCommission: '10', minimumInvestment: '500000', verificationRequired: true, maintenanceMode: false, allowNewRegistrations: true });
  const [notifications, setNotifications] = useState({ applicationAlerts: true, systemUpdates: true });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: '30', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showSecurityNew, setShowSecurityNew] = useState(false);
  const [showSecurityConfirm, setShowSecurityConfirm] = useState(false);
  const [showSecurityCurrent, setShowSecurityCurrent] = useState(false);

  const handleProfile = (e) => { const { name, value } = e.target; setProfile(prev => ({ ...prev, [name]: value })); };
  const handlePlatform = (e) => { const { name, value, type, checked } = e.target; setPlatform(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
  const handleNotifications = (e) => { const { name, checked } = e.target; setNotifications(prev => ({ ...prev, [name]: checked })); };
  const handleSecurity = (e) => { const { name, value, type, checked } = e.target; setSecurity(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

  const handleSave = () => { setSaved(true); toast.success('Settings saved successfully!'); setTimeout(() => setSaved(false), 2500); };

  const tabs = [
    { key: 'profile',       label: 'Profile',           icon: User      },
    { key: 'platform',      label: 'Platform Settings', icon: Settings2 },
    { key: 'notifications', label: 'Notifications',     icon: Bell      },
    { key: 'security',      label: 'Security',          icon: Lock      },
  ];

  const Field = ({ label, name, type = 'text', value, onChange, placeholder, prefix, suffix }) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: TEXT_SECONDARY, fontWeight: '600', pointerEvents: 'none' }}>{prefix}</span>}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: '100%', padding: prefix ? '10px 14px 10px 28px' : suffix ? '10px 44px 10px 14px' : '10px 14px', border: `1.5px solid ${BORDER_COLOR}`, borderRadius: '8px', fontSize: '14px', color: TEXT_PRIMARY, background: INPUT_BG, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
          onFocus={e => { e.target.style.borderColor = THEME; }}
          onBlur={e => { e.target.style.borderColor = BORDER_COLOR; }}
        />
        {suffix}
      </div>
    </div>
  );

  const ToggleRow = ({ name, checked, onChange, label, description, danger }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: danger && checked ? '#fff5f5' : CARD_BG, borderRadius: '9px', border: `1.5px solid ${danger && checked ? '#fecaca' : BORDER_COLOR}`, marginBottom: '10px', transition: 'all 0.2s' }}>
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: danger ? '#dc2626' : TEXT_PRIMARY }}>{label}</p>
        {description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: TEXT_SECONDARY }}>{description}</p>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: checked ? (danger ? '#ef4444' : THEME) : '#d1d5db', borderRadius: '24px', transition: '0.25s' }}>
          <span style={{ position: 'absolute', height: '18px', width: '18px', left: checked ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </span>
      </label>
    </div>
  );

  const SectionLabel = ({ label }) => (
    <p style={{ fontSize: '11px', fontWeight: '800', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '28px 0 12px', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '8px' }}>{label}</p>
  );

  const SaveButton = ({ label = 'Save Changes' }) => (
    <motion.button
      onClick={handleSave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '28px', backgroundColor: saved ? '#16a34a' : THEME, color: 'white', padding: '11px 28px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(26,35,50,0.2)' }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={saved ? "saved" : "save"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {saved ? <><Check size={16} />Saved!</> : <><Save size={16} />{label}</>}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  const PasswordField = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: '100%', padding: '10px 40px 10px 14px', border: `1.5px solid ${BORDER_COLOR}`, borderRadius: '8px', fontSize: '14px', color: TEXT_PRIMARY, outline: 'none', background: INPUT_BG, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => { e.target.style.borderColor = THEME; }}
          onBlur={e => { e.target.style.borderColor = BORDER_COLOR; }}
        />
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TEXT_SECONDARY, padding: 0 }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '28px', backgroundColor: BG_COLOR, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px' }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: TEXT_PRIMARY, margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: TEXT_SECONDARY, margin: 0 }}>Manage your profile and platform configuration</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '22px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ width: '210px', flexShrink: 0, background: CARD_BG, borderRadius: '11px', border: `1px solid ${BORDER_COLOR}`, padding: '8px', overflow: 'hidden' }}
        >
          {tabs.map(({ key, label, icon: Icon }, i) => {
            const isActive = activeTab === key;
            return (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '11px 14px', background: isActive ? THEME : 'transparent', color: isActive ? 'white' : TEXT_SECONDARY, border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: isActive ? '600' : '500', marginBottom: '2px', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f0f2f5'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} />}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ flex: 1, background: CARD_BG, borderRadius: '11px', border: `1px solid ${BORDER_COLOR}`, padding: '28px 32px' }}
        >
          <AnimatePresence mode="wait">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: TEXT_PRIMARY, margin: '0 0 4px' }}>Admin Profile</h2>
                <p style={{ fontSize: '13px', color: TEXT_SECONDARY, margin: '0 0 24px' }}>Your personal admin account details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Full Name" name="fullName" value={profile.fullName} onChange={handleProfile} placeholder="Your name" />
                  <Field label="Email Address" name="email" type="email" value={profile.email} onChange={handleProfile} placeholder="admin@example.com" />
                </div>
                <SectionLabel label="Change Password" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <PasswordField label="Current Password" name="currentPassword" value={profile.currentPassword} onChange={handleProfile} show={showCurrentPassword} onToggle={() => setShowCurrentPassword(p => !p)} placeholder="Enter current password" />
                  <PasswordField label="New Password" name="newPassword" value={profile.newPassword} onChange={handleProfile} show={showNewPassword} onToggle={() => setShowNewPassword(p => !p)} placeholder="Enter new password" />
                </div>
                <SaveButton label="Save Profile" />
              </motion.div>
            )}

            {/* PLATFORM TAB */}
            {activeTab === 'platform' && (
              <motion.div key="platform" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: TEXT_PRIMARY, margin: '0 0 4px' }}>Platform Settings</h2>
                <p style={{ fontSize: '13px', color: TEXT_SECONDARY, margin: '0 0 8px' }}>System-level configuration that affects the entire platform</p>
                <SectionLabel label="General" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Platform Name" name="platformName" value={platform.platformName} onChange={handlePlatform} placeholder="e.g. FranchiFi" />
                  <Field label="Support Email" name="supportEmail" type="email" value={platform.supportEmail} onChange={handlePlatform} placeholder="support@example.com" />
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Default Currency</label>
                    <select name="defaultCurrency" value={platform.defaultCurrency} onChange={handlePlatform} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${BORDER_COLOR}`, borderRadius: '8px', fontSize: '14px', color: TEXT_PRIMARY, background: INPUT_BG, outline: 'none', boxSizing: 'border-box' }}>
                      <option value="INR">INR — Indian Rupee (₹)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                    </select>
                  </div>
                </div>
                <SectionLabel label="Business Rules" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Field label="Default Commission %" name="defaultCommission" type="number" value={platform.defaultCommission} onChange={handlePlatform} placeholder="e.g. 10" suffix={<span style={{ position: 'absolute', right: '12px', fontSize: '13px', color: TEXT_SECONDARY, fontWeight: '600' }}>%</span>} />
                  <Field label="Minimum Investment Amount" name="minimumInvestment" type="number" value={platform.minimumInvestment} onChange={handlePlatform} placeholder="e.g. 500000" prefix="₹" />
                </div>
                <ToggleRow name="verificationRequired" checked={platform.verificationRequired} onChange={handlePlatform} label="Verification Required" description="New franchise applications must be verified before going live" />
                <SectionLabel label="System Control" />
                <ToggleRow name="allowNewRegistrations" checked={platform.allowNewRegistrations} onChange={handlePlatform} label="Allow New Registrations" description="Let new investors and franchisees sign up on the platform" />
                <ToggleRow name="maintenanceMode" checked={platform.maintenanceMode} onChange={handlePlatform} label="Maintenance Mode" description="Puts the platform offline for all users except admins" danger />
                <AnimatePresence>
                  {platform.maintenanceMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: '9px', marginTop: '4px' }}>
                        <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>Maintenance mode is <strong>ON</strong>. The platform is currently inaccessible to all users. Turn it off to restore access.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <SaveButton label="Save Platform Settings" />
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: TEXT_PRIMARY, margin: '0 0 4px' }}>Notifications</h2>
                <p style={{ fontSize: '13px', color: TEXT_SECONDARY, margin: '0 0 24px' }}>Choose what alerts and updates you want to receive</p>
                <SectionLabel label="Application" />
                <ToggleRow name="applicationAlerts" checked={notifications.applicationAlerts} onChange={handleNotifications} label="Application Alerts" description="Get notified when investors apply to your franchises" />
                <SectionLabel label="System" />
                <ToggleRow name="systemUpdates" checked={notifications.systemUpdates} onChange={handleNotifications} label="System Updates" description="Platform maintenance notices and feature announcements" />
                <SaveButton label="Save Notification Settings" />
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: TEXT_PRIMARY, margin: '0 0 4px' }}>Security</h2>
                <p style={{ fontSize: '13px', color: TEXT_SECONDARY, margin: '0 0 24px' }}>Manage your account security settings</p>
                <SectionLabel label="Change Password" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <PasswordField label="Current Password" name="currentPassword" value={security.currentPassword} onChange={handleSecurity} show={showSecurityCurrent} onToggle={() => setShowSecurityCurrent(p => !p)} placeholder="Enter current password" />
                  <PasswordField label="New Password" name="newPassword" value={security.newPassword} onChange={handleSecurity} show={showSecurityNew} onToggle={() => setShowSecurityNew(p => !p)} placeholder="Enter new password" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <PasswordField label="Confirm New Password" name="confirmPassword" value={security.confirmPassword} onChange={handleSecurity} show={showSecurityConfirm} onToggle={() => setShowSecurityConfirm(p => !p)} placeholder="Re-enter new password" />
                </div>
                <SectionLabel label="Access Control" />
                <ToggleRow name="twoFactor" checked={security.twoFactor} onChange={handleSecurity} label="Two-Factor Authentication" description="Add an extra layer of security to your admin account" />
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Session Timeout (minutes)</label>
                  <select name="sessionTimeout" value={security.sessionTimeout} onChange={handleSecurity} style={{ width: '200px', padding: '10px 14px', border: `1.5px solid ${BORDER_COLOR}`, borderRadius: '8px', fontSize: '14px', color: TEXT_PRIMARY, background: INPUT_BG, outline: 'none', boxSizing: 'border-box' }}>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <SaveButton label="Save Security Settings" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;