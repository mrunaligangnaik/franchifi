import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdCurrencyRupee } from "react-icons/md";
import { FiCheckCircle, FiClock, FiShield } from "react-icons/fi";
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

const ApplyFranchise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [currentState, setCurrentState] = useState("FORM"); // "FORM" | "PAYMENT_DONE" | "SUBMITTED"
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const { user, token, loading: authLoading } = useAuth();
  const [franchise, setFranchise] = useState(null);
  const [franchiseLoading, setFranchiseLoading] = useState(true);

  const imageMap = {
    "coffee.jpg": coffee,
    "restaurant.jpg": restaurant,
    "retail.jpg": retail,
    "fitness.jpg": fitness,
    "beauty.jpg": beauty,
    "education.jpg": education,
    "automotive.jpg": automotive,
  };

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    investmentBudget: "",
    fundSource: "",
    hasBusinessExperience: "",
    experienceDescription: "",
    industryExperience: "",
    preferredLocation: "",
    hasSpace: "",
    spaceSize: "",
    startTimeline: "",
    followSOP: "",
    additionalInfo: "",
    consent: false,
  });

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/franchises/${id}`);
        setFranchise(res.data);
        setFranchiseLoading(false);
      } catch (err) {
        console.error("Failed to fetch franchise", err);
        setFranchise(null);
        setFranchiseLoading(false);
      }
    };

    fetchFranchise();
  }, [id]);

  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("✅ Razorpay loaded");
    script.onerror = () => console.error("❌ Razorpay failed to load");
    document.body.appendChild(script);
  }, []);

  // ✅ Populate form when user is available
  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    }));
  }, [user]);

  // ✅ FIX: Auth check - NO REDIRECT, just check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      setIsChecking(false);
      return;
    }

    if (user.role !== "investor") {
      alert("Only investors can apply for a franchise");
      navigate("/", { replace: true });
      return;
    }

    setIsChecking(false);
  }, [user, token, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    // ✅ CHECK AUTH BEFORE PAYMENT
    if (!user || !token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    if (!form.consent) {
      alert("Please accept the declaration to continue");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/applications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          franchiseId: franchise._id,
          franchiseName: franchise.name, // ✅ ADDED
          franchiseImage: franchise.image,      // ADD THIS
          franchiseLocation: franchise.location,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          investmentBudget: form.investmentBudget,
          fundSource: form.fundSource,
          hasBusinessExperience: form.hasBusinessExperience,
          experienceDescription: form.experienceDescription,
          industryExperience: form.industryExperience,
          preferredLocation: form.preferredLocation,
          hasSpace: form.hasSpace,
          spaceSize: form.spaceSize,
          startTimeline: form.startTimeline,
          followSOP: form.followSOP,
          additionalInfo: form.additionalInfo,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to create application");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setApplicationId(data.applicationId);

      const { orderId, key, amount, currency } = data;

      // Step 2: Open Razorpay with the order
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: orderId,
        name: "FranchiFi",
        description: "Franchise Application Fee",
        handler: async function (response) {
          await verifyPayment(data.applicationId, response);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: "#000000" },
      };

      if (!window.Razorpay) {
        alert("Payment SDK not loaded. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Error creating application:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const verifyPayment = async (applicationId, paymentResponse) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/payments/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          }),
        }
      );

      if (!res.ok) throw new Error("Verification failed");

      setCurrentState("PAYMENT_DONE");
    } catch (err) {
      alert("Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicationId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setCurrentState("SUBMITTED");
      setLoading(false);
    } catch (err) {
      alert(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || authLoading || franchiseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Franchise not found</h2>
          <p className="text-gray-500 mt-2">The franchise you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
        {/* LEFT – FORM (STATE 1) */}
        {currentState === "FORM" && (
          <form
            onSubmit={handleProceedToPayment}
            className="lg:col-span-2 bg-white rounded-2xl shadow p-10 space-y-10"
          >
            <div>
              <h1 className="text-2xl font-semibold">Franchise Application</h1>
              <p className="text-sm text-gray-500 mt-1">
                Applying for: <span className="font-medium text-gray-700">{franchise.name}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Reviewed directly by the Franchisor
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Section title="Applicant Details">
                <div className="space-y-5">
                  <Field label="Full Name *" hint="Your legal name">
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field label="Email *">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field label="Mobile Number *">
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field label="Current City *">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Business Background">
                <div className="space-y-5">
                  <Field label="Industry Experience">
                    <select
                      name="industryExperience"
                      value={form.industryExperience}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option>Food & Beverage</option>
                      <option>Retail</option>
                      <option>Service</option>
                      <option>None</option>
                    </select>
                  </Field>

                  <Field label="Experience Summary" hint="Max 300 characters">
                    <textarea
                      name="experienceDescription"
                      rows={4}
                      maxLength={300}
                      value={form.experienceDescription}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Investment Capacity">
                <Field label="Total Investment Budget *">
                  <select
                    name="investmentBudget"
                    value={form.investmentBudget}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select range</option>
                    <option>₹5–10 Lakh</option>
                    <option>₹10–25 Lakh</option>
                    <option>₹25–50 Lakh</option>
                    <option>₹50 Lakh+</option>
                  </select>
                </Field>
              </Section>

              <Section title="Location & Setup">
                <Field label="Preferred Franchise Location *">
                  <input
                    type="text"
                    name="preferredLocation"
                    value={form.preferredLocation}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </Section>

              <Section title="Timeline">
                <Field label="When do you plan to start? *">
                  <select
                    name="startTimeline"
                    value={form.startTimeline}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>Immediately (0–1 month)</option>
                    <option>1–3 months</option>
                    <option>3–6 months</option>
                  </select>
                </Field>
              </Section>

              <div className="md:col-span-2">
                <Section title="Additional Information (Optional)">
                  <Field label="">
                    <textarea
                      name="additionalInfo"
                      rows={8}
                      value={form.additionalInfo}
                      onChange={handleChange}
                      className="resize-none"
                      placeholder="Tell us more about your background, experience, or any questions you have..."
                    />
                  </Field>
                </Section>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                className="mt-1 cursor-pointer"
                required
              />
              <p>
                I confirm the information is accurate and I agree to be contacted
                by the Franchisor. *
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        )}

        {/* PAYMENT DONE STATE (STATE 2) */}
        {currentState === "PAYMENT_DONE" && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-10 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Payment Successful!
              </h2>
              <p className="text-sm text-gray-500">
                Your payment has been verified successfully.
              </p>
              <p className="text-xs text-gray-400">
                Application ID: <span className="font-mono font-medium">{applicationId}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <h3 className="font-medium text-gray-700">Payment Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Franchise:</span>
                  <span className="font-medium">{franchise.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Application Fee:</span>
                  <span className="font-medium">₹500</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">paid</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitApplication}
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        )}

        {/* FINAL SUBMITTED STATE (STATE 3) */}
        {currentState === "SUBMITTED" && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-10 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-gray-500">
                Your application for <span className="font-medium">{franchise.name}</span> has been submitted to the Franchisor.
              </p>
              <p className="text-xs text-gray-400">
                Application ID: <span className="font-mono font-medium">{applicationId}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left">
              <h3 className="font-medium text-gray-700">What happens next?</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                <li>Application review by Franchisor (1-2 days)</li>
                <li>Direct contact from the Franchisor</li>
                <li>Discussion and approval process</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard/investor/applications")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                View Applications
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* RIGHT – SUMMARY (ALWAYS VISIBLE) */}
        <aside className="bg-white rounded-2xl shadow p-6 space-y-6 h-fit sticky top-10">
          <div className="w-full h-40 rounded-xl overflow-hidden">
            <img
              src={imageMap[franchise.image] || franchise.image}
              alt={franchise.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">{franchise.name}</h3>
            <p className="text-sm text-gray-500">Franchise Summary</p>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <MdCurrencyRupee />
              Minimum investment ₹{franchise.minInvestment.toLocaleString("en-IN")}
            </li>
            <li className="flex items-center gap-2">
              <FiClock />
              ROI expected in 3–5 years
            </li>
            <li className="flex items-center gap-2">
              <FiCheckCircle />
              Training & launch support included
            </li>
          </ul>

          <div className="border-t pt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">What happens next</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Application review (1-2 days)</li>
              <li>Direct Franchisor contact</li>
              <li>Discussion & approval</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiShield />
            Information shared securely with Franchisor
          </div>
        </aside>
      </div>
    </div>
  );
};

/* HELPERS */

const Section = ({ title, children }) => (
  <div className="space-y-5">
    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
      {title}
    </h2>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-medium text-gray-600">{label}</label>
    )}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
    <div
      className="[&>input,&>select,&>textarea]:w-full
      [&>input,&>select,&>textarea]:px-4
      [&>input,&>select,&>textarea]:py-3
      [&>input,&>select,&>textarea]:rounded-lg
      [&>input,&>select,&>textarea]:bg-gray-100
      [&>input,&>select,&>textarea]:border-0
      [&>input,&>select,&>textarea]:outline-none
      focus-within:ring-2 ring-gray-300"
    >
      {children}
    </div>
  </div>
);

export default ApplyFranchise;