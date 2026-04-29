import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold mb-6"
      >
        Discover Profitable Franchise Opportunities
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-lg text-gray-600 max-w-3xl mx-auto mb-10"
      >
        Connect with verified franchisors and explore investment-ready
        businesses that match your goals.
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center gap-4"
      >
        <Link
          to="/marketplace"
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-900 transition"
        >
          Explore Marketplace
        </Link>

        <Link
          to="/register"
          className="border border-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
      </motion.div>

    </section>
  );
}
