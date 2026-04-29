import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-6"
        >
          About Our Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-600"
        >
          We connect serious investors with verified franchise Franchisors
          across India — simply, transparently, and efficiently.
        </motion.p>
      </section>

      {/* WHAT WE DO */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">
              What We Do
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Finding the right franchise or the right investor is often
              time-consuming and unclear. Our platform removes unnecessary
              middlemen and brings both sides together with verified
              information and clear expectations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-white border rounded-2xl p-8"
          >
            <ul className="space-y-4 text-sm">
              <li>• Verified franchise listings</li>
              <li>• Transparent investment details</li>
              <li>• Direct investor–Franchisor communication</li>
              <li>• Location-based discovery</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* WHY WE EXIST */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold mb-6"
          >
            Why We Built This
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-gray-600 leading-relaxed"
          >
            Franchise expansion and investment decisions should be based on
            clarity, not guesswork. We built this platform to make franchise
            discovery and expansion more structured, data-driven, and
            accessible for everyone involved.
          </motion.p>
        </div>
      </section>

      {/* FOOTER LINE */}
      <section className="bg-black text-white py-10">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm">
          Building trust between investors and franchise Franchisors.
        </div>
      </section>

    </main>
  );
}
