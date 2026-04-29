import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiArrowLeft,
  FiTrendingUp,
  FiHome,
  FiPercent,
  FiCheckCircle,
  FiAward,
  FiUsers,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  coffee,
  restaurant,
  retail,
  fitness,
  beauty,
  education,
  automotive,
} from "../assets";

const FranchiseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [franchise, setFranchise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const imageMap = {
    "coffee.jpg": coffee,
    "restaurant.jpg": restaurant,
    "retail.jpg": retail,
    "fitness.jpg": fitness,
    "beauty.jpg": beauty,
    "education.jpg": education,
    "automotive.jpg": automotive,
  };

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/franchises/${id}`);
        setFranchise(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch franchise", err);
        setIsLoading(false);
      }
    };

    fetchFranchise();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Franchise not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER */}
      <div className="relative h-80">
        <img
          src={imageMap[franchise.image] || franchise.image}
          alt={franchise.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-white opacity-80 hover:opacity-100 cursor-pointer"
          >
            <FiArrowLeft /> Back to Search
          </button>
        </div>

        <div className="absolute bottom-8 left-8 z-10 text-white">
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            PREMIUM LISTING
          </span>
          <h1 className="text-3xl font-bold mt-3">{franchise.name}</h1>
          <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
            <FiMapPin /> {franchise.location || "Multiple Locations"}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-10">
          {/* STATS */}
          <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <Stat
              icon={<MdCurrencyRupee />}
              label="Min Investment"
              value={`₹${franchise.minInvestment.toLocaleString("en-IN")}`}
            />
            <Stat
              icon={<MdCurrencyRupee />}
              label="Franchise Fee"
              value="₹30,000"
            />
            <Stat icon={<FiPercent />} label="Royalty" value="6%" />
            <Stat icon={<FiTrendingUp />} label="ROI Term" value="3–5 Years" />
            <Stat icon={<FiHome />} label="Space Req." value="150–300 sqft" />
          </div>

          {/* ABOUT */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              About the Opportunity
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {franchise.description ||
                "This franchise offers a scalable and proven business model with strong Franchisor support, training, and marketing assistance."}
            </p>
          </section>

          {/* SUPPORT */}
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Support & Training
            </h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
              <li>2-week initial training program at HQ</li>
              <li>On-site launch support</li>
              <li>Ongoing marketing & operational assistance</li>
              <li>Global supply chain access</li>
            </ul>
          </section>

          {/* REQUIREMENTS - NEW SECTION */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Requirements</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
              <li>Minimum capital: ₹{franchise.minInvestment.toLocaleString("en-IN")}</li>
              <li>Prior business experience preferred but not mandatory</li>
              <li>Location preference: High footfall areas or commercial zones</li>
              <li>Store size requirement: 150–300 sqft</li>
            </ul>
          </section>

          {/* ABOUT THE Franchisor - NEW SECTION */}
          <section>
            <h2 className="text-lg font-semibold mb-3">About the Franchisor</h2>
            <div className="bg-gray-50 rounded-lg p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Franchisor</p>
                <p className="font-semibold text-gray-800">{franchise.name} Pvt Ltd</p>
              </div>
              <div>
                <p className="text-gray-500">Founded</p>
                <p className="font-semibold text-gray-800">2016</p>
              </div>
              <div>
                <p className="text-gray-500">Headquarters</p>
                <p className="font-semibold text-gray-800">{franchise.location || "Pune"}</p>
              </div>
              <div>
                <p className="text-gray-500">Outlets</p>
                <p className="font-semibold text-gray-800">45+</p>
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(franchise.images || [
                franchise.image,
                franchise.image,
                franchise.image,
              ]).map((img, i) => (
                <img
                  key={i}
                  src={imageMap[img] || img}
                  alt="Franchise Gallery"
                  className="h-40 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR — APPLY PANEL */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-semibold">
            Become a {franchise.name} Franchise Partner
          </h3>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2 items-start">
              <FiCheckCircle className="text-green-600 mt-0.5" />
              Minimum investment ₹{franchise.minInvestment.toLocaleString("en-IN")}
            </li>
            <li className="flex gap-2 items-start">
              <FiCheckCircle className="text-green-600 mt-0.5" />
              Expected ROI in 3–5 years
            </li>
            <li className="flex gap-2 items-start">
              <FiCheckCircle className="text-green-600 mt-0.5" />
              Complete training & launch support
            </li>
            <li className="flex gap-2 items-start">
              <FiCheckCircle className="text-green-600 mt-0.5" />
              High-demand consumer category
            </li>
          </ul>

          <div className="text-sm text-gray-500">
            Best suited for first-time entrepreneurs and growth-focused investors.
          </div>

          {/* APPLICATION FEE - NEW */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Application Fee</p>
            <p className="text-2xl font-bold text-gray-800">₹500</p>
            <p className="text-xs text-gray-500 mt-1">One-time, non-refundable</p>
          </div>

          <p className="text-xs text-gray-400">
            Applications are reviewed by the franchise management team.
          </p>

          <button
            onClick={() => {
              if (loading) return;

              if (!user) {
                toast.info("Please login to apply");
                navigate("/register");
                return;
              }

              if (user.role !== "investor") {
                toast.error("Only investors can apply");
                return;
              }

              navigate(`/dashboard/investor/apply/${franchise._id}`);
            }}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 cursor-pointer"
          >
            Apply for Franchise
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div>
    <div className="flex justify-center text-xl text-gray-600 mb-1">
      {icon}
    </div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-sm">{value}</p>
  </div>
);

export default FranchiseDetails;