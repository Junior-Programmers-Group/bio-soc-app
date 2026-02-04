import Navbar from "../components/Home/Navbar/Navbar";
import Hero from "../components/Home/Hero/Hero";
import AboutEcoTagging from "../components/AboutEcoTagging/AboutEcoTagging";
import WhyEcoTagging from "../components/Home/WhyEcoTagging/WhyEcoTagging";
import Location from "../components/Home/Location/Location";
import Partners from "../components/Home/Partners/Partners";

const Home = () => {
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
