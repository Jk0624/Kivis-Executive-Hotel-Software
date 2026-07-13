import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";


type AdminLayoutProps = {
  children: React.ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  return (
  <div className="flex min-h-screen bg-slate-100">

    <AdminSidebar />

    <main className="flex-1 p-8">

    <AdminHeader />

    {children}

    </main>

  </div>
);
}

export default AdminLayout;