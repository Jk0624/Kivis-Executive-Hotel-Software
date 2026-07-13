import Sidebar from "../components/receptionist/Sidebar";
import ReceptionistHeader from "../components/receptionist/ReceptionistHeader";

type ReceptionistLayoutProps = {
  children: React.ReactNode;
};

function ReceptionistLayout({ children }: ReceptionistLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-72 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Scrollable Content */}
      <main className="ml-72 flex-1 overflow-y-auto p-8">

        <ReceptionistHeader />

        {children}

      </main>
    </div>
  );
}

export default ReceptionistLayout; 