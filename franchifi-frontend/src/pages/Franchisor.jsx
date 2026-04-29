import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiTrendingUp,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiXCircle,
  FiInfo,
} from "react-icons/fi";

export default function Franchisor() {
  return (
    <main className="bg-white text-gray-900 overflow-hidden">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Empowering Franchisors to Connect with Serious Investors
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 max-w-3xl mx-auto mb-10"
        >
          Franchisors create growth opportunities by listing verified franchise
          concepts that investors can explore. Each listing highlights investment
          potential, location preferences, and business value — helping investors
          make informed decisions.
        </motion.p>
      </section>

      {/* CORE VALUE */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-16">
            How Franchisors Drive Opportunities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <FiUsers size={28} />,
                title: "Attract Serious Investors",
                text: "Franchisors connect with verified investors who are ready to invest in proven concepts.",
              },
              {
                icon: <FiMessageSquare size={28} />,
                title: "Transparent & Direct",
                text: "Communicate directly with potential investors without intermediaries or hidden costs.",
              },
              {
                icon: <FiTrendingUp size={28} />,
                title: "Scale with Clarity",
                text: "List your franchise details professionally to showcase growth potential and ROI to interested investors.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white border rounded-2xl p-8 text-center hover:shadow-lg transition"
              >
                <div className="flex justify-center mb-5 text-black">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FRANCHISOR PROCESS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12">
            How Franchising Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Franchisor designs and documents their business model",
              "Investors explore and analyze investment potential",
              "Direct engagement between franchisor and investor",
              "Growth strategy is implemented regionally",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="border rounded-xl p-6 flex items-center gap-4"
              >
                <FiCheckCircle className="text-black" />
                <p className="font-medium">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTOR OPPORTUNITIES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-14">
            Opportunities Created for Investors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              "Showcase investment-ready franchises",
              "Highlight ROI, payback, and growth metrics",
              "Allow investors to compare multiple opportunities",
              "Enable direct applications",
              "Support region-based expansion",
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white border rounded-xl p-6 text-center"
              >
                <div className="text-2xl font-bold mb-2">{i + 1}</div>
                <p className="text-sm text-gray-600">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPORTANT RULES FOR INVESTORS ─── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest">
                <FiShield size={13} /> Important Guidelines
              </span>
            </div>
            <h2 className="text-3xl font-semibold mb-4">
              Rules Every Investor Must Know
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Before exploring or applying to any franchise listing, please read
              and understand the following platform rules. These ensure a fair
              and professional experience for all parties.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <FiXCircle size={20} className="text-black shrink-0 mt-0.5" />,
                title: "One-Time Application per Franchise",
                desc: "Once an investor's application is rejected by a franchisor, they cannot re-apply to that same franchise opportunity. Each rejection is final and permanent for that listing.",
                tag: "Rejection Policy",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
              {
                icon: <FiAlertCircle size={20} className="text-black shrink-0 mt-0.5" />,
                title: "Franchisors Are Admin-Verified Only",
                desc: "Franchisors cannot self-register on this platform. All franchise listings are added and verified exclusively by our admin team (24/7) to maintain quality and authenticity.",
                tag: "Verified Listings",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
              {
                icon: <FiInfo size={20} className="text-black shrink-0 mt-0.5" />,
                title: "No Duplicate Applications",
                desc: "Investors may not submit multiple applications for the same franchise listing. Only one application per franchise per investor is allowed at any given time.",
                tag: "Application Limit",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
              {
                icon: <FiShield size={20} className="text-black shrink-0 mt-0.5" />,
                title: "Investor Verification Required",
                desc: "All investors must complete profile verification before applying to any franchise. Unverified accounts will not be considered by franchisors.",
                tag: "Verification",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
              {
                icon: <FiXCircle size={20} className="text-black shrink-0 mt-0.5" />,
                title: "Rejection Cannot Be Appealed",
                desc: "If a franchisor rejects an investor's application, the decision is non-negotiable on the platform. Disputes must be handled directly outside the platform if applicable.",
                tag: "Final Decision",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
              {
                icon: <FiAlertCircle size={20} className="text-black shrink-0 mt-0.5" />,
                title: "Franchisor Communication is Binding",
                desc: "Any commitments or agreements made directly between franchisor and investor during the engagement process are considered binding. Ensure clarity before proceeding.",
                tag: "Communication Policy",
                tagColor: "bg-gray-100 text-black border-gray-200",
              },
            ].map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border rounded-2xl p-6 hover:shadow-md transition bg-white"
              >
                <div className="flex items-start gap-3 mb-3">
                  {rule.icon}
                  <div>
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-2 ${rule.tagColor}`}
                    >
                      {rule.tag}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">
                      {rule.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-7">
                  {rule.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Platform disclaimer bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex items-start gap-3"
          >
            <FiInfo size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-700">Platform Note: </span>
              All franchise listings on this platform are curated and approved solely by our administrative team. Franchisors do not have self-registration access. This ensures every listing is legitimate, verified, and meets our quality standards before investors can interact with them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <motion.section
        className="bg-black text-white py-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Explore Verified Franchise Opportunities
          </h2>
          <p className="text-white mb-8 max-w-xl mx-auto text-sm">
            Browse our curated list of admin-verified franchise listings and find
            the right investment opportunity that matches your goals and region.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/marketplace"
              className="inline-block bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Browse Franchises
            </Link>
            <Link
              to="/register"
              className="inline-block border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-black transition"
            >
              Create Investor Account
            </Link>
          </div>
        </div>
      </motion.section>

    </main>
  );
}