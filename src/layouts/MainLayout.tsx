import Navbar from "../components/navigation/Navbar";

type MainLayoutProps = {
  children: React.ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar />

      <main>{children}</main>
    </div>
  );
}

export default MainLayout;