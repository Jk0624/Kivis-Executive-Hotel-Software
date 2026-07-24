import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

type AdminLayoutProps = {
  children: React.ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">

      <AdminSidebar />

      <main className="ml-72 min-h-screen bg-slate-100">
  <AdminHeader />

  <div className="p-8">
    {children}
  </div>
</main>

    </div>
  );
}

export default AdminLayout;