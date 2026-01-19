import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import AboutEcoTagging from "../components/AboutEcoTagging/AboutEcoTagging";
import WhyEcoTagging from "../components/WhyEcoTagging/WhyEcoTagging";
import Location from "../components/Location/Location";
import Partners from "../components/Partners/Partners";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <AboutEcoTagging />
      <WhyEcoTagging />
      <Location />
      <Partners />
    </>
  );
};

export default Home;
