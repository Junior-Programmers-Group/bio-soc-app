import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Home/Navbar/Navbar";
import Hero from "../components/Home/Hero/Hero";
import AboutEcoTagging from "../components/AboutEcoTagging/AboutEcoTagging";
import WhyEcoTagging from "../components/Home/WhyEcoTagging/WhyEcoTagging";
import Location from "../components/Home/Location/Location";
import Partners from "../components/Home/Partners/Partners";

const Home = () => {
  // links like /#about (the phone tab bar) scroll to that section
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Navbar variant="home" />
      <Hero />
      <AboutEcoTagging />
      <WhyEcoTagging />
      <Location />
      <Partners />
    </>
  );
};

export default Home;
