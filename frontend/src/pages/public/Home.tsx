import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";
import Hero from "../../components/home/Hero";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import FeaturedRooms from "../../components/home/FeaturedRooms";
import GalleryPreview from "../../components/home/GalleryPreview";
import About from "../../components/home/About";
import Contact from "../../components/home/Contact";

function Home() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("scroll") === "contact") {
      const section =
        document.getElementById("contact");

      if (section) {
        setTimeout(() => {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }

      window.history.replaceState(
        {},
        "",
        "/"
      );
    }
  }, [location]);

  return (
    <MainLayout>

      <Hero />

      <FeaturedRooms />

      <WhyChooseUs />

      <About />

      <GalleryPreview />

      <Contact />

    </MainLayout>
  );
}

export default Home;