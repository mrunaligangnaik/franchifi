import {Link} from "react-router-dom";
import React from "react";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Footer from "../components/Footer";
import Features from "../components/features";


export default function Landing() {
  return (
    <>

      <Hero />
      <Stats />
      <Features />
      <Footer />
    </>
  );
}

