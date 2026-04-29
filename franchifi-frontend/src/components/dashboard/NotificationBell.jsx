import { Bell, CheckCheck, MessageSquare, Reply } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// ✅ Props:
// position="right"  → dropdown opens to the left  (default, for top navbars)
// position="left"   → dropdown opens to the right (for sidebars — prevents clipping)
// darkMode={true}   → white bell icon for dark sidebars
const NotificationBell = ({ position = "right", darkMode = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const boxRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ FIXED: Don't call API if not logged in — prevents 401 error
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ FIXED: Don't parse body if response is not OK (e.g. 401, 403)
      if (!res.ok) return;

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const socket = io("http://localhost:5000");
    socket.emit("join", userId);

    socket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    const token = localStorage.getItem("token");
    if (!token) return; // ✅ FIXED: Guard here too
    fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      })
      .catch(() => console.log("Failed to mark as read"));
  };

  const markAllAsRead = () => {
    const token = localStorage.getItem("token");
    if (!token) return; // ✅ FIXED: Guard here too
    fetch("http://localhost:5000/api/notifications/read-all", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch(() => console.log("Failed to mark all as read"));
  };

  const getNotificationStyle = (notification) => {
    // ✅ NEW: franchisor replied to investor's rejection query — blue badge
    if (notification.type === "franchisor_reply") {
      return {
        icon: <Reply className={`w-5 h-5 ${!notification.read ? "text-white" : "text-blue-400"}`} />,
        bgColor: !notification.read ? "bg-blue-500" : "bg-blue-100",
        label: "Franchisor Reply",
        labelColor: "text-blue-700 bg-blue-50 border-blue-200",
      };
    }

    if (notification.type === "investor_query") {
      return {
        icon: <MessageSquare className={`w-5 h-5 ${!notification.read ? "text-white" : "text-orange-400"}`} />,
        bgColor: !notification.read ? "bg-orange-500" : "bg-orange-100",
        label: "Investor Query",
        labelColor: "text-orange-600 bg-orange-50 border-orange-200",
      };
    }
    if (notification.type === "status_update") {
      if (notification.message.includes("approved")) {
        return {
          icon: <Bell className={`w-5 h-5 ${!notification.read ? "text-white" : "text-green-500"}`} />,
          bgColor: !notification.read ? "bg-green-600" : "bg-green-100",
          label: "Approved",
          labelColor: "text-green-700 bg-green-50 border-green-200",
        };
      }
      if (notification.message.includes("rejected")) {
        return {
          icon: <Bell className={`w-5 h-5 ${!notification.read ? "text-white" : "text-red-400"}`} />,
          bgColor: !notification.read ? "bg-red-500" : "bg-red-100",
          label: "Rejected",
          labelColor: "text-red-700 bg-red-50 border-red-200",
        };
      }
      if (notification.message.includes("shortlisted")) {
        return {
          icon: <Bell className={`w-5 h-5 ${!notification.read ? "text-white" : "text-purple-400"}`} />,
          bgColor: !notification.read ? "bg-purple-600" : "bg-purple-100",
          label: "Shortlisted",
          labelColor: "text-purple-700 bg-purple-50 border-purple-200",
        };
      }
    }
    return {
      icon: <Bell className={`w-5 h-5 ${!notification.read ? "text-white" : "text-gray-500"}`} />,
      bgColor: !notification.read ? "bg-gray-700" : "bg-gray-200",
      label: null,
      labelColor: "",
    };
  };

  // ✅ "left" position = dropdown opens rightward (sidebar use)
  // ✅ "right" position = dropdown opens leftward (navbar use)
  const dropdownPosition = position === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full transition-all duration-300 cursor-pointer ${
          shake ? "animate-shake" : ""
        } ${
          darkMode
            ? "hover:bg-white/10"
            : "hover:bg-gray-100"
        }`}
      >
        {/* ✅ Bell color changes based on darkMode prop */}
        <Bell className={`w-6 h-6 ${darkMode ? "text-white" : "text-gray-700"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${dropdownPosition} mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-999 overflow-hidden animate-slideDown`}
        >
          <div className="px-5 py-4 bg-gray-900 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-xs text-gray-300 opacity-90">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all duration-200 flex items-center gap-1 border border-white/20"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              (showAll ? notifications : notifications.slice(0, 5)).map((n, index) => {
                const style = getNotificationStyle(n);
                return (
                  <div
                    key={n._id}
                    className={`px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer animate-fadeIn relative group ${
                      !n.read ? "bg-gray-50" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => !n.read && markAsRead(n._id)}
                  >
                    <div className="flex gap-3">
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bgColor}`}>
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {style.label && (
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mb-1 ${style.labelColor}`}>
                            {style.label}
                          </span>
                        )}
                        <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {!n.read && (
                        <div className="shrink-0">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n._id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <CheckCheck className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 text-center border-t border-gray-200">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
              >
                {showAll ? "Show less" : "View all notifications"}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
};

export default NotificationBell;