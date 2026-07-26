import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Hotel,
  Menu,
  X,
} from "lucide-react";
import api from "../../services/api";
import NotificationBell from "./NotificationBell";
import GuestDropdown from "./GuestDropdown";

function Navbar() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [notificationCount, setNotificationCount] =
    useState(0);

  /* Mobile Drawer */

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
  const response = await api.get("/profile");

  const currentUser = response.data.user;

  if (currentUser.role === "GUEST") {
    setIsLoggedIn(true);

    setUser({
      name: currentUser.name || "Guest",
      email: currentUser.email || "",
    });
  } else {
    setIsLoggedIn(false);

    setUser({
      name: "",
      email: "",
    });
  }
} catch (error) {
        console.error(error);

        localStorage.removeItem("token");

        setIsLoggedIn(false);

        setUser({
          name: "",
          email: "",
        });
      }

      try {
        const notificationResponse =
          await api.get(
            "/guest/notifications/recent"
          );

        setNotificationCount(
          notificationResponse.data.notifications
            .length
        );
      } catch {
        setNotificationCount(0);
      }
    };

    fetchProfile();
  }, []);

  /* Lock page scroll while drawer is open */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* Close drawer with ESC */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    closeMobileMenu();
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
    <>
      {/* Overlay */}

      {mobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:h-24 sm:px-6 lg:px-8">

          {/* Logo */}

          <Link
            to="/"
            onClick={handleHomeClick}
            className="group flex items-center gap-3"
          >
            <div className="rounded-xl bg-yellow-50 p-2 transition-all duration-300 group-hover:scale-105">
              <Hotel className="h-7 w-7 text-yellow-500 sm:h-8 sm:w-8" />
            </div>

            <div className="leading-tight">
              <h2 className="text-sm font-bold tracking-tight text-blue-900 sm:text-base lg:text-lg">
                KIVIS EXECUTIVE LODGE
              </h2>

              <p className="hidden text-[11px] uppercase tracking-[0.35em] text-slate-500 sm:block">
                Smart Hospitality
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-8 lg:flex">

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

          {/* Desktop Right Side */}

          <div className="hidden items-center gap-5 lg:flex">

            {isLoggedIn ? (
              <>
                <NotificationBell
                  unreadCount={notificationCount}
                />

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

          {/* Mobile Right Side */}

          <div className="flex items-center gap-3 lg:hidden">

            {isLoggedIn && (
              <NotificationBell
                unreadCount={notificationCount}
              />
            )}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open navigation menu"
              className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>

          </div>

        </div>
      </nav>

      {/* Mobile Drawer */}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-yellow-50 p-2">
              <Hotel className="h-7 w-7 text-yellow-500" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">
                KIVIS EXECUTIVE LODGE
              </h2>

              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Smart Hospitality
              </p>
            </div>

          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X className="h-6 w-6 text-slate-700" />
          </button>

        </div>

                {/* Mobile Navigation */}

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="flex flex-col space-y-2">

            <Link
              to="/"
              onClick={handleHomeClick}
              className={`${navLinkClass("/")} rounded-lg px-2 py-3 after:hidden`}
            >
              Home
            </Link>

            <Link
              to="/rooms"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/rooms")} rounded-lg px-2 py-3 after:hidden`}
            >
              Rooms
            </Link>

            <Link
              to="/gallery"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/gallery")} rounded-lg px-2 py-3 after:hidden`}
            >
              Gallery
            </Link>

            <Link
              to="/about"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/about")} rounded-lg px-2 py-3 after:hidden`}
            >
              About
            </Link>

            <Link
              to="/#contact"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/#contact")} rounded-lg px-2 py-3 after:hidden`}
            >
              Contact
            </Link>

          </div>

          <div className="my-8 border-t border-slate-200" />

          {isLoggedIn ? (
            <div className="space-y-6">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {user.email}
                </p>
              </div>

              <GuestDropdown
                name={user.name}
                email={user.email}
              />

            </div>
          ) : (
            <div className="space-y-4">

              <Link
                to="/signin"
                onClick={closeMobileMenu}
                className="block rounded-xl border border-blue-700 px-5 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="block rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
              >
                Create Account
              </Link>

            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Navbar;