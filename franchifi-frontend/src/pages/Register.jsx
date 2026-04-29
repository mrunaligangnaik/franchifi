import { useState, useEffect } from "react";  // ✅ MOVE TO TOP - FIRST IMPORT
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaUserTie, FaBuilding, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

const roles = [
  { name: "Investor", Icon: FaUserTie },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get message and redirectTo from navigation state

  const [role, setRole] = useState("Investor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // ✅ Show toast notification when message exists

  // useEffect(() => {
  //   if (localStorage.getItem("token")) {
  //     navigate("/", { replace: true });
  //   }
  // }, [navigate]);

  // ✅ Password validation (no toast while typing)
  const validatePassword = (pwd) => {
    const rules = [
      { test: pwd.length >= 8, msg: "Minimum 8 characters" },
      { test: /[A-Z]/.test(pwd), msg: "At least 1 uppercase letter" },
      { test: /\d/.test(pwd), msg: "At least 1 number" },
      { test: /[@$!%*?&]/.test(pwd), msg: "At least 1 special symbol (@$!%*?&)" },
    ];

    const failed = rules.filter(r => !r.test);

    if (failed.length > 0) {
      setPasswordValid(false);
      return false;
    }

    setPasswordValid(true);
    return true;
  };

  const handleRegister = async () => {
    // ✅ Full Name validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please fill the details");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      toast.error("Name can only contain letters and spaces");
      return;
    }
    // Check if full name contains at least two words
    const words = trimmedName.split(/\s+/);
    if (words.length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    // ✅ Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // ✅ Password validation
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Please enter a strong password");
      return;
    }

    // ✅ Submit registration
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      // ✅ Store token and role after successful registration
      const roleFromBackend = data.role?.toLowerCase();

      toast.success("Account created successfully. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      toast.error("Server error");
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
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-gray-300 mt-1">
            Join FranchiFi to start your journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="p-6 space-y-5"
        >
          {/* ROLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-sm font-medium mb-2">I am register as...</p>
            <div className="flex justify-center">
              {roles.map(({ name, Icon }) => (
                <motion.button
                  key={name}
                  onClick={() => setRole(name)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center gap-1 border rounded-md py-3 px-6 text-sm font-medium cursor-pointer
                    ${role === name ? "border-black bg-gray-100" : "border-gray-300 text-gray-500"}`}
                >
                  <Icon size={16} className="text-gray-400" />
                  <span>{name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* FULL NAME */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.36 }}
          >
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative mt-1">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="••••••••"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md outline-none"
              />
            </div>
          </motion.div>

          {/* EMAIL */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.43 }}
          >
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="••••••••"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md outline-none"
              />
            </div>
          </motion.div>

          {/* PASSWORD */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white rounded-md outline-none"
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

          {/* SUBMIT */}
          <motion.button
            onClick={handleRegister}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.57 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-linear-to-r from-gray-900 to-gray-800 text-white py-2 rounded-md font-semibold cursor-pointer"
          >
            Create Account
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.62 }}
            className="text-center text-sm text-gray-600"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black font-medium"
            >
              Log In
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;