import Sidebar from "../components/receptionist/Sidebar";
import ReceptionistHeader from "../components/receptionist/ReceptionistHeader";

type ReceptionistLayoutProps = {
  children: React.ReactNode;
};

function ReceptionistLayout({
  children,
}: ReceptionistLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Fixed Sidebar */}

      <div className="fixed left-0 top-0 z-40 h-screen w-72">
        <Sidebar />
      </div>

      {/* Main Content */}

      <main className="ml-72 min-h-screen bg-slate-100">

        <ReceptionistHeader />

        <div className="p-8">

          {children}

        </div>

      </main>

    </div>
  );
}

export default ReceptionistLayout; 