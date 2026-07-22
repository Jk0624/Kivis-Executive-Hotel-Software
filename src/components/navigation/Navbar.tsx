import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Hotel } from "lucide-react";
import axios from "axios";
import NotificationBell from "./NotificationBell";
import GuestDropdown from "./GuestDropdown";

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

  const navLinkClass = (path: string) => {
    const isActive =
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path);

    return `
      relative
      py-2
      text-sm
      font-medium
      tracking-wide
      transition-all
      duration-300
      after:absolute
      after:left-0
      after:-bottom-1
      after:h-[2px]
      after:rounded-full
      after:transition-all
      after:duration-300
      ${
        isActive
          ? "text-yellow-500 after:w-full after:bg-yellow-500"
          : "text-slate-700 after:w-0 after:bg-blue-700 hover:text-blue-700 hover:after:w-full"
      }
    `;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          onClick={handleHomeClick}
          className="group flex items-center gap-3"
        >
          <div className="rounded-xl bg-yellow-50 p-2 transition-all duration-300 group-hover:scale-105">
            <Hotel className="h-8 w-8 text-yellow-500" />
          </div>

          <div className="leading-tight">
            <h2 className="text-1xl font-bold tracking-tight text-blue-900">
              KIVIS EXECUTIVE LODGE
            </h2>

            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Smart Hospitality
            </p>
          </div>
        </Link>

        {/* Navigation */}

        <div className="flex items-center gap-10">

          <Link
            to="/"
            onClick={handleHomeClick}
            className={navLinkClass("/")}
          >
            Home
          </Link>

          <Link
            to="/rooms"
            className={navLinkClass("/rooms")}
          >
            Rooms
          </Link>

          <Link
            to="/gallery"
            className={navLinkClass("/gallery")}
          >
            Gallery
          </Link>

          <Link
            to="/about"
            className={navLinkClass("/about")}
          >
            About
          </Link>

          <Link
            to="/#contact"
            className={navLinkClass("/#contact")}
          >
            Contact
          </Link>

        </div>

        {/* Right Side */}

        <div className="flex items-center gap-5">

          {isLoggedIn ? (
            <>
              <NotificationBell unreadCount={3} />

              <GuestDropdown
                name={user.name}
                email={user.email}
              />
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="rounded-xl border border-blue-700 px-5 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg"
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