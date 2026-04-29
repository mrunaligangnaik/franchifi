import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center h-16 px-6">

        {/* LOGO */}
        <Link
          to="/"
          className="text-lg font-bold whitespace-nowrap hover:opacity-80 transition"
        >
          Franchi<span className="text-gray-500">Fi</span>
        </Link>

        {/* CENTER NAV */}
        <ul className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-700">
          <Link to="/marketplace" className="hover:text-black">
            Marketplace
          </Link>
          <Link to="/investor" className="hover:text-black">
            For Investors
          </Link>
          <Link to="/Franchisor" className="hover:text-black">
            For Franchisor
          </Link>
          <Link to="/about" className="hover:text-black">
            About
          </Link>
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-900 transition"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}
