import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { coffee, fitness, restaurant, retail, moveRight } from "../assets";

const franchises = [
  { id: 1, name: "Coffee Hub", investment: "₹15L – ₹25L", image: coffee },
  { id: 2, name: "Fitness Pro", investment: "₹20L – ₹40L", image: fitness },
  { id: 3, name: "Restaurant King", investment: "₹30L – ₹50L", image: restaurant },
  { id: 4, name: "Retail Store", investment: "₹25L – ₹35L", image: retail },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const Features = () => {
  return (
    <motion.section
      className="my-16 px-6 md:px-16"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          variants={fadeUp}
          className="text-2xl font-bold"
        >
          Featured Opportunities
        </motion.h2>

        <Link to="/marketplace">
          <motion.div
            whileHover={{ x: 5 }}
            className="text-blue-600 flex items-center gap-1 font-medium cursor-pointer"
          >
            View all
            <img src={moveRight} alt="arrow" className="h-4 w-4" />
          </motion.div>
        </Link>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {franchises.map((franchise, index) => (
          <motion.div
            key={franchise.id}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white"
          >
            <img
              src={franchise.image}
              alt={franchise.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{franchise.name}</h3>
              <p className="text-gray-600 mt-1">
                Investment: {franchise.investment}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.section>
  );
};

export default Features;
