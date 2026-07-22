import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Hotel } from "lucide-react";
import NotificationBell from "./NotificationBell";
import GuestDropdown from "./GuestDropdown";
import axios from "axios";

function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({
  name: "",
  email: "",
});

  useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3001/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(JSON.stringify(response.data.user, null, 2));

      setIsLoggedIn(true);
      setUser({
        name: response.data.user.name || "Guest",
        email: response.data.user.email || "",
      });
    } catch (error) {
      console.error(error);

      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser({
  name: "",
  email: "",
});
    }
  };

  fetchProfile();
}, []);

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        {/* Logo */}

        <div className="flex items-center gap-2">

          <Hotel className="h-8 w-8 text-yellow-500" />

          <h2 className="text-2xl font-bold text-blue-900">
            Kiviz Executive Lodge
          </h2>

        </div>

        {/* Center Navigation */}

        <ul className="flex items-center gap-8 font-medium text-slate-700">

          <Link
            to="/"
            onClick={handleHomeClick}
            className="hover:text-blue-700"
          >
            Home
          </Link>

          <Link
            to="/rooms"
            className="hover:text-blue-700"
          >
            Rooms
          </Link>

          <Link
            to="/gallery"
            className="hover:text-blue-700"
          >
            Gallery
          </Link>

          <Link
            to="/about"
            className="hover:text-blue-700"
          >
            About
          </Link>

          <Link
            to="/#contact"
            className="hover:text-blue-700"
          >
            Contact
          </Link>

        </ul>

        {/* Right Buttons */}

        <div className="flex items-center gap-3">

          {isLoggedIn ? (
  <div className="flex items-center gap-4">
    <NotificationBell unreadCount={3} />

    <GuestDropdown
      name={user.name}
      email={user.email}
    />
  </div>
) : (
            <>
              <Link
                to="/signin"
                className="rounded-lg border border-blue-700 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800"
              >
                Create Account
              </Link>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;