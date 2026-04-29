import { Bell, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import axios from "axios";

const NavbarDashboard = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Navbar user fetch error:", err));
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-full">

        {/* LOGO */}
        <NavLink
          to="/dashboard/investor"
          className="text-lg font-bold whitespace-nowrap"
        >
          Franchi<span className="text-gray-500">Fi</span>
        </NavLink>

        {/* CENTER NAV */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-700">
          <NavLink to="/dashboard/investor" end>Marketplace</NavLink>
          <NavLink to="/dashboard/investor/applications">Application Status</NavLink>
          <NavLink to="/dashboard/investor/about">About</NavLink>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-5 relative" ref={menuRef}>

          {/* ✅ NOTIFICATION BELL — already here for investor */}
          <NotificationBell />

          {/* AVATAR */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2"
          >
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <ChevronDown
              size={16}
              className={`transition-transform cursor-pointer ${open ? "rotate-180 cursor-pointer" : ""}`}
            />
          </button>

          {/* DROPDOWN */}
          <div
            className={`absolute right-0 top-12 w-44 rounded-xl bg-white
              shadow-[0_10px_30px_rgba(0,0,0,0.12)]
              transform transition-all duration-200 origin-top
              ${open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
            `}
          >
            <button
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/investor/profile");
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700
                hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100
                rounded-t-xl transition-all duration-200 cursor-pointer
                hover:text-gray-900 font-medium flex items-center gap-2
                hover:translate-x-1"
            >
              My Profile
            </button>

            <div className="h-px bg-gray-100 mx-3" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600
                hover:text-red-700 hover:bg-linear-to-r hover:from-red-50
                hover:to-red-100 rounded-b-xl transition-all duration-200
                cursor-pointer flex items-center gap-2 hover:translate-x-1"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarDashboard;