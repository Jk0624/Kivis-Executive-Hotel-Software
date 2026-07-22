import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  User,
  BedDouble,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";
import UserAvatar from "./UserAvatar";

interface GuestDropdownProps {
  name: string;
  email: string;
}

export default function GuestDropdown({
  name,
  email,
}: GuestDropdownProps) {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/signin");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-gray-100"
      >
        <UserAvatar name={name} />

        <span className="font-medium text-slate-700">
          {name}
        </span>

        <ChevronDown
          className={`h-4 w-4 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border bg-white shadow-xl">

          {/* Header */}

          <div className="border-b p-5">

            <div className="flex items-center gap-3">

              <UserAvatar name={name} />

              <div>

                <p className="font-semibold text-slate-800">
                  {name}
                </p>

                <p className="text-sm text-slate-500">
                  {email}
                </p>

              </div>

            </div>

          </div>

          {/* Menu */}

          <div className="py-2">

            <Link
              to="/guest/profile"
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <User size={18} />
              My Profile
            </Link>

            <Link
              to="/guest/bookings"
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <BedDouble size={18} />
              My Bookings
            </Link>

            <Link
              to="/guest/payments"
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <CreditCard size={18} />
              Payment History
            </Link>

            <Link
              to="/guest/notifications"
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <Bell size={18} />
              Notifications
            </Link>

          </div>

          <div className="border-t p-2">

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

        </div>
      )}
    </div>
  );
}