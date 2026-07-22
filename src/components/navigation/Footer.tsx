import { Link, useLocation } from "react-router-dom";
import {
  Hotel,
  Phone,
  Mail,
  MapPin,
  Clock3,
} from "lucide-react";

function Footer() {
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-500/10 p-2">
              <Hotel className="h-8 w-8 text-yellow-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Kiviz Executive Lodge
              </h2>

              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Smart Hospitality
              </p>
            </div>
          </div>

          <p className="mt-6 leading-8 text-slate-400">
            Experience elegant accommodation, secure smart room access,
            exceptional hospitality, and modern comfort designed to make every
            stay unforgettable.
          </p>
        </div>

        {/* Quick Links */}

        <div>
          <h3 className="text-lg font-semibold text-white">
            Quick Links
          </h3>

          <ul className="mt-6 space-y-4 text-slate-400">

            <li>
              <Link
                to="/"
                onClick={handleHomeClick}
                className="transition-all duration-300 hover:pl-1 hover:text-yellow-400"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/rooms"
                className="transition-all duration-300 hover:pl-1 hover:text-yellow-400"
              >
                Rooms
              </Link>
            </li>

            <li>
              <Link
                to="/gallery"
                className="transition-all duration-300 hover:pl-1 hover:text-yellow-400"
              >
                Gallery
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="transition-all duration-300 hover:pl-1 hover:text-yellow-400"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/#contact"
                className="transition-all duration-300 hover:pl-1 hover:text-yellow-400"
              >
                Contact
              </Link>
            </li>

          </ul>
        </div>

        {/* Contact */}

        <div>
          <h3 className="text-lg font-semibold text-white">
            Contact Us
          </h3>

          <div className="mt-6 space-y-5 text-slate-400">

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-yellow-400" />
              <p>Accra, Ghana</p>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-yellow-400" />
              <p>+233 XX XXX XXXX</p>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-yellow-400" />
              <p>info@kivizlodge.com</p>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 text-yellow-400" />
              <p>Reception Open 24 Hours</p>
            </div>

          </div>
        </div>

        {/* Why Choose Us */}

        <div>
          <h3 className="text-lg font-semibold text-white">
            Why Choose Us
          </h3>

          <p className="mt-6 leading-7 text-slate-400">
            We are committed to providing every guest with a secure,
            comfortable and memorable hospitality experience.
          </p>

          <div className="mt-6 space-y-4 text-slate-400">

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>Luxury Accommodation</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>Smart Room Access</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>Free High-Speed Wi-Fi</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>24-Hour Reception</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>Exceptional Guest Service</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Bar */}

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500 md:flex-row">

          <p>
            © {new Date().getFullYear()} Kiviz Executive Lodge. All Rights Reserved.
          </p>

          <div className="flex gap-6">

            <Link
              to="#"
              className="transition duration-300 hover:text-yellow-400"
            >
              Privacy Policy
            </Link>

            <Link
              to="#"
              className="transition duration-300 hover:text-yellow-400"
            >
              Terms of Service
            </Link>

          </div>

        </div>
      </div>

    </footer>
  );
}

export default Footer;