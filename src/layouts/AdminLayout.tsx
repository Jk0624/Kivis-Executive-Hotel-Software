import { useState } from "react";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

type AdminLayoutProps = {
  children: React.ReactNode;
};

function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-72">

        <AdminHeader
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

export default AdminLayout;