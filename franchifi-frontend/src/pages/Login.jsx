import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaUserTie, FaBuilding, FaUserShield } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const roles = [
  { name: "Investor", Icon: FaUserTie },
  { name: "Franchisor", Icon: FaBuilding },
  { name: "Admin", Icon: FaUserShield },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // ✅ Get message and redirectTo from navigation state
  const message = location.state?.message;
  const redirectTo = location.state?.redirectTo;

  const [role, setRole] = useState("Investor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warning("Email and password required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("API Response:", data);

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // ✅ FIX: Backend NOW returns { token, user } (with full user object)
      if (!data.user || !data.token) {
        console.error("Invalid response structure:", data);
        toast.error("Invalid server response");
        return;
      }

      const roleFromBackend = data.user.role.toLowerCase();
      const selectedRole = role.toLowerCase();

      // ✅ Simple and correct role match
      if (roleFromBackend !== selectedRole) {
        toast.error(
          `This account is registered as "${data.user.role}". Please select the correct role.`
        );
        return;
      }

      // ✅ Save auth
      login(data.user, data.token);

      toast.success("Login successful");

      // ✅ FIXED: If there's a redirectTo (e.g. came from Marketplace → Register/Login),
      //    send them back to that page instead of always going to dashboard
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      // ✅ Default dashboard navigation by role
      if (roleFromBackend === "investor") {
        navigate("/dashboard/investor");
      } else if (roleFromBackend === "franchisor") {
        navigate("/dashboard/franchisor");
      } else if (roleFromBackend === "admin") {
        navigate("/dashboard/admin");
      } else {
        toast.error("Unknown role");
      }

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed - network or server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-linear-to-r from-gray-900 to-gray-800 text-white text-center py-6"
        >
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-300 mt-1">
            Enter your details to access your account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="p-6 space-y-5"
        >
          {/* ROLE SELECTOR */}
          <div>
            <p className="text-sm font-medium mb-2">Login As..</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ name, Icon }, i) => (
                <motion.button
                  key={name}
                  onClick={() => setRole(name)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
                  className={`flex flex-col items-center gap-1 border rounded-md py-2 text-sm font-medium cursor-pointer
                    ${role === name
                      ? "border-black bg-gray-100"
                      : "border-gray-300 text-gray-500"
                    }`}
                >
                  <Icon size={16} className="text-gray-400" />
                  <span>{name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* EMAIL */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <label className="text-xs font-medium text-gray-500">
              Email Address
            </label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-md outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          {/* PASSWORD */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.48 }}
          >
            <label className="text-xs font-medium text-gray-500">
              Password
            </label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 bg-gray-800 text-white rounded-md outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={showPassword ? "off" : "on"}
                    initial={{ opacity: 0, rotate: -10 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          {/* SIGN IN BUTTON */}
          <motion.button
            onClick={handleLogin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-linear-to-r from-gray-900 to-gray-800 text-white py-2 rounded-md font-semibold cursor-pointer"
          >
            Sign In
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-center text-sm text-gray-600"
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              state={{ message, redirectTo }}
              className="text-black font-medium"
            >
              Register
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;