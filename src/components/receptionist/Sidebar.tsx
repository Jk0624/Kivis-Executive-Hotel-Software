import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import LogoutModal from "../common/LogoutModal";

import {
  LayoutDashboard,
  CalendarDays,
  UserPlus,
  LogIn,
  LogOut,
  BedDouble,
  Users,
  Bell,
  Clock3,
  Building2,
} from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

function Sidebar() {
  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const navigationRef =
    useRef<HTMLDivElement>(null);

  const linkRefs = useRef<
    Record<string, HTMLAnchorElement | null>
  >({});

  const SCROLL_KEY =
    "reception-sidebar-scroll";

  const operations: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/receptionist/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bookings",
      path: "/receptionist/bookings",
      icon: CalendarDays,
    },
    {
      name: "Walk-in Booking",
      path: "/receptionist/walkin",
      icon: UserPlus,
    },
    {
      name: "Check-In",
      path: "/receptionist/checkin",
      icon: LogIn,
    },
    {
      name: "Check-Out",
      path: "/receptionist/checkout",
      icon: LogOut,
    },
    {
      name: "Booking Extension",
      path: "/receptionist/booking-extension",
      icon: Clock3,
    },
  ];

  const management: MenuItem[] = [
    {
      name: "Rooms",
      path: "/receptionist/rooms",
      icon: BedDouble,
    },
    {
      name: "Guest Management",
      path: "/receptionist/guests",
      icon: Users,
    },
    {
      name: "Notifications",
      path: "/receptionist/notifications",
      icon: Bell,
    },
  ];

  /* Restore sidebar scroll */

  useEffect(() => {
    const saved =
      sessionStorage.getItem(SCROLL_KEY);

    if (navigationRef.current && saved) {
      navigationRef.current.scrollTop =
        Number(saved);
    }
  }, []);

  /* Save scroll position */

  useEffect(() => {
    const container =
      navigationRef.current;

    if (!container) return;

    const handleScroll = () => {
      sessionStorage.setItem(
        SCROLL_KEY,
        container.scrollTop.toString()
      );
    };

    container.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      container.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  /* Keep active link visible */

  useEffect(() => {
    const activeLink =
      linkRefs.current[location.pathname];

    if (activeLink) {
      activeLink.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [location.pathname]);

  function renderSection(
    title: string,
    items: MenuItem[]
  ) {
    return (
      <div>

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">

          {title}

        </p>

        <nav className="space-y-2">

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                ref={(el) => {
                  linkRefs.current[item.path] = el;
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "border-l-4 border-blue-500 bg-blue-600/15 font-semibold text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />

                <span>{item.name}</span>

              </NavLink>
            );
          })}

        </nav>

      </div>
    );
  }

  return (
    <>
      <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">

        {/* Brand */}

        <div className="border-b border-slate-800 px-6 py-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 shadow-lg">

              <Building2 size={24} />

            </div>

            <div>

              <h2 className="text-lg font-bold tracking-wide">
                KIVIZ EXECUTIVE
              </h2>

              <p className="text-sm font-medium text-yellow-400">
                Reception Portal
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <div
          ref={navigationRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
                    {renderSection("Operations", operations)}

          <div className="my-8 border-t border-slate-800" />

          {renderSection("Management", management)}

        </div>

        {/* Receptionist */}

        <div className="border-t border-slate-800 p-5">

          <div className="rounded-2xl bg-slate-900 p-4">

            <p className="text-xs uppercase tracking-widest text-slate-500">
              Logged In
            </p>

            <h3 className="mt-2 font-semibold">
              Receptionist
            </h3>

            <p className="text-sm text-slate-400">
              Front Desk
            </p>

            <div className="mt-4 flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-sm text-emerald-400">
                Online
              </span>

            </div>

          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);

          toast.success("Logged out successfully");

          navigate("/");
        }}
      />

    </>
  );
}

export default Sidebar;