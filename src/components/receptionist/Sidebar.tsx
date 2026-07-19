import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutModal from "../common/LogoutModal";




function Sidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  return (
    <aside className="w-72 bg-slate-900 text-white p-6">

      <h2 className="mb-10 text-2xl font-bold">
        Kivis Executive Hotel
      </h2>

      <nav>
        <ul className="space-y-4">

          <li>
            <NavLink
              to="/receptionist/dashboard"
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
              to="/receptionist/bookings"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              📖 Bookings
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/receptionist/walkin"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              🚶 Walk-in Booking
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/receptionist/checkin"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              🏨 Check-In
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/receptionist/checkout"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              🚪 Check-Out
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/receptionist/booking-extension"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              📅 Booking Extension
            </NavLink>
          </li>


          <li>
            <NavLink
              to="/receptionist/rooms"
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
              to="/receptionist/guests"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              👤 Guest Management
            </NavLink>
          </li>

      

          <li>
            <NavLink
              to="/receptionist/notifications"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`
              }
            >
              🔔 Notifications
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

          // Later we'll also clear the authentication token here

          toast.success("Logged out successfully");

          navigate("/");
        }}
      />

    </aside>
  );
}

export default Sidebar;