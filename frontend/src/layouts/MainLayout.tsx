import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

type MainLayoutProps = {
  children: React.ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}

export default MainLayout;