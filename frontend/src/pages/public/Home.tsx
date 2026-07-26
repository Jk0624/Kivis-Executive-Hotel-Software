import MainLayout from "../../layouts/MainLayout";
import Hero from "../../components/home/Hero";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import FeaturedRooms from "../../components/home/FeaturedRooms";
import GalleryPreview from "../../components/home/GalleryPreview"; 
import About from "../../components/home/About";
import Contact from "../../components/home/Contact";

function Home() {
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