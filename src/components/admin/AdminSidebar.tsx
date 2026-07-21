import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "../common/LogoutModal";

function AdminSidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

const navigate = useNavigate();

  
  return (

    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">

  {/* Logo */}

  <div className="border-b border-slate-700 p-6">

    <h1 className="text-2xl font-bold">
      Kiviz Executive Lodge
    </h1>

    <p className="mt-2 text-sm text-slate-400">
      Administration Portal
    </p>

  </div>

  {/* Navigation */}

  <nav className="flex-1 p-4">

    <ul className="space-y-2">

      <li>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          📊 Dashboard
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/rooms"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          🏨 Rooms
        </NavLink>

      </li>


      <li>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          📅 Bookings
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/guests"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          👥 Guests
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/receptionists"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          👨‍💼 Receptionists
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/access-devices"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          📡 Access Devices
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/security-audit"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          🔒 Security Audit
        </NavLink>

      </li>

      <li>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`
          }
        >
          👤 Profile
        </NavLink>

      </li>

      <li>

  <button
    onClick={() => setShowLogoutModal(true)}
    className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-slate-800"
  >
    🚪 Logout
  </button>

</li>

    </ul>

  </nav>

  <LogoutModal
  isOpen={showLogoutModal}
  onCancel={() => setShowLogoutModal(false)}
  onConfirm={() => {
    setShowLogoutModal(false);

    // Later we'll clear the JWT/session here

    navigate("/");
  }}
/>

</aside>
  ); 
}

export default AdminSidebar;