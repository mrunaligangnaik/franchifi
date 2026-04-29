import { globe, analytics, shield } from "../assets";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Stats() {
  return (
    <motion.section
      className="py-16 bg-gray-50"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto grid gap-6 px-6 md:grid-cols-3">

        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="bg-white p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <img src={globe} alt="Global Reach" className="h-10 w-10" />
            <div>
              <h3 className="font-semibold">Global Reach</h3>
              <p className="text-sm text-gray-600">
                Connect with investors and franchise Franchisors worldwide.
              </p>
            </div>
          </div>

          <Link
            to="/marketplace"
            className="mt-auto text-sm font-medium text-black underline"
          >
            Explore Marketplace →
          </Link>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="bg-white p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <img src={analytics} alt="Smart Analytics" className="h-10 w-10" />
            <div>
              <h3 className="font-semibold">Smart Analytics</h3>
              <p className="text-sm text-gray-600">
                Make data-driven investment decisions confidently.
              </p>
            </div>
          </div>

          <Link
            to="/investor"
            className="mt-auto text-sm font-medium text-black underline"
          >
            View Insights →
          </Link>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="bg-white p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <img src={shield} alt="Verified Listings" className="h-10 w-10" />
            <div>
              <h3 className="font-semibold">Verified Listings</h3>
              <p className="text-sm text-gray-600">
                Every franchise opportunity is vetted and secure.
              </p>
            </div>
          </div>

          <Link
            to="/Franchisor"
            className="mt-auto text-sm font-medium text-black underline"
          >
            List Your Franchise →
          </Link>
        </motion.div>

      </div>
    </motion.section>
  );
}
