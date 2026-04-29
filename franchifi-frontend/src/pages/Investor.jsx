import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiTrendingUp,
  FiCheckCircle,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Investor() {
  return (
    <main className="bg-white text-gray-900 overflow-hidden">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Invest in Verified Franchise Opportunities
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 max-w-3xl mx-auto mb-10"
        >
          Find profitable franchise businesses based on your budget, risk
          appetite, and preferred location — without hidden surprises.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4"
        >
          <Link
            to="/marketplace"
            className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-900"
          >
            Explore Marketplace
          </Link>
          <Link
            to="/register"
            className="border border-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Sign Up as Investor
          </Link>
        </motion.div>
      </section>

      {/* KEY BENEFITS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-14">
            Built for Serious Investors
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* LEFT – FEATURED BENEFIT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl border shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-4">
                Only Verified Franchise Opportunities
              </h3>
              <p className="text-gray-600 mb-6">
                Every franchise listed goes through document checks, investment
                validation, and business screening — so you don’t waste time on
                unverified Franchisors.
              </p>

              <ul className="space-y-3 text-sm text-gray-700">
                <li>✔ Franchisor & legal verification</li>
                <li>✔ Transparent investment structure</li>
                <li>✔ Real expansion potential</li>
              </ul>
            </motion.div>

            {/* RIGHT – SUPPORTING POINTS */}
            <div className="space-y-6">
              {[
                {
                  title: "Compare ROI & Payback",
                  text: "Analyze returns, costs, and timelines before applying.",
                },
                {
                  title: "Location-Based Discovery",
                  text: "Find franchises that match your preferred city or region.",
                },
                {
                  title: "Direct Application",
                  text: "Apply without brokers or middlemen.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border rounded-xl p-6 hover:shadow-sm transition"
                >
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-14">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              "Create your investor profile",
              "Browse verified franchises",
              "Compare & shortlist",
              "Apply directly",
              "Launch your franchise",
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white border rounded-xl p-6 text-center"
              >
                <div className="text-2xl font-bold mb-2">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to Invest with Confidence?
          </h2>
          <p className="text-gray-300 mb-8">
            Explore franchise opportunities built for long-term success.
          </p>
          <Link
            to="/marketplace"
            className="inline-block bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-200"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>

    </main>
  );
}
