import { useState } from "react";

import Sidebar from "../components/receptionist/Sidebar";
import ReceptionistHeader from "../components/receptionist/ReceptionistHeader";

type ReceptionistLayoutProps = {
  children: React.ReactNode;
};

function ReceptionistLayout({
  children,
}: ReceptionistLayoutProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-72">

        <ReceptionistHeader
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <div className="p-4 sm:p-6 lg:p-8">

          {children}

        </div>

      </main>

    </div>
  );
}

export default ReceptionistLayout;