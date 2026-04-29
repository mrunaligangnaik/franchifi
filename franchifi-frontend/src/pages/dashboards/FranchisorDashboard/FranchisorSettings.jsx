import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const FranchisorSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    applicationAlerts: true,
    systemUpdates: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    secCurrentPassword: '',
    secNewPassword: '',
    secConfirmPassword: '',
  });

  const [showSecCurrent, setShowSecCurrent] = useState(false);
  const [showSecNew, setShowSecNew] = useState(false);
  const [showSecConfirm, setShowSecConfirm] = useState(false);

  const handleNotifications = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleSecurity = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurity(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { key: 'notifications', label: 'Notifications', icon: FiBell },
    { key: 'security',      label: 'Security',      icon: FiLock },
  ];

  const SettingToggle = ({ name, label, checked, onChange, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
      <div>
        <span className="text-gray-900 font-medium text-sm">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <label className="relative inline-block w-12 h-6 shrink-0 ml-4">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-gray-900 transition-colors"></div>
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6"></div>
      </label>
    </div>
  );

  const PasswordField = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors bg-white"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  const SectionLabel = ({ label }) => (
    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mt-6 mb-3 pb-2 border-b border-gray-100">{label}</p>
  );

  const SaveButton = () => (
    <motion.button
      onClick={handleSave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={saved ? "saved" : "save"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your account preferences</p>
        </motion.div>

        <div className="flex gap-5 items-start">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-48 shrink-0 bg-white rounded-xl border border-gray-200 p-2"
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
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 text-left
                    ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Icon size={14} />
                  <span className="flex-1">{label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex-1 bg-white rounded-xl border border-gray-200 p-7"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg"><FiBell className="w-5 h-5 text-gray-900" /></div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                      <p className="text-xs text-gray-500">Choose what alerts you want to receive</p>
                    </div>
                  </div>
                  <SectionLabel label="Application" />
                  <SettingToggle name="applicationAlerts" label="Application Alerts" checked={notifications.applicationAlerts} onChange={handleNotifications} description="Get notified when investors apply to your franchise" />
                  <SectionLabel label="System" />
                  <SettingToggle name="systemUpdates" label="System Updates" checked={notifications.systemUpdates} onChange={handleNotifications} description="Platform maintenance notices and announcements" />
                  <SaveButton />
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg"><FiLock className="w-5 h-5 text-gray-900" /></div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Security</h2>
                      <p className="text-xs text-gray-500">Manage your account security settings</p>
                    </div>
                  </div>
                  <SectionLabel label="Change Password" />
                  <div className="grid grid-cols-2 gap-4">
                    <PasswordField label="Current Password" name="secCurrentPassword" value={security.secCurrentPassword} onChange={handleSecurity} show={showSecCurrent} onToggle={() => setShowSecCurrent(p => !p)} placeholder="Enter current password" />
                    <PasswordField label="New Password" name="secNewPassword" value={security.secNewPassword} onChange={handleSecurity} show={showSecNew} onToggle={() => setShowSecNew(p => !p)} placeholder="Enter new password" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PasswordField label="Confirm New Password" name="secConfirmPassword" value={security.secConfirmPassword} onChange={handleSecurity} show={showSecConfirm} onToggle={() => setShowSecConfirm(p => !p)} placeholder="Re-enter new password" />
                  </div>
                  <SectionLabel label="Access Control" />
                  <SettingToggle name="twoFactor" label="Two-Factor Authentication" checked={security.twoFactor} onChange={handleSecurity} description="Add an extra layer of security to your account" />
                  <SaveButton />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FranchisorSettings;