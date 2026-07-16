import { Link, useLocation } from "react-router-dom";
import {
  Hotel,
  Phone,
  Mail,
  MapPin,
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
    <footer className="bg-slate-900 text-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">

        {/* Hotel */}

        <div>

          <div className="flex items-center gap-2">

            <Hotel className="h-8 w-8 text-yellow-400" />

            <h2 className="text-2xl font-bold">
              Kiviz Executive Hotel
            </h2>

          </div>

          <p className="mt-5 leading-7 text-slate-300">
            Experience luxury, comfort and secure smart room access
            designed to make every stay memorable.
          </p>

        </div>

        {/* Quick Links */}

        <div>

          <h3 className="text-xl font-semibold">
            Quick Links
          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>
              <Link
                to="/"
                onClick={handleHomeClick}
                className="transition hover:text-yellow-400"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/rooms"
                className="transition hover:text-yellow-400"
              >
                Rooms
              </Link>
            </li>

            <li>
              <Link
                to="/gallery"
                className="transition hover:text-yellow-400"
              >
                Gallery
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="transition hover:text-yellow-400"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/#contact"
                className="transition hover:text-yellow-400"
              >
                Contact
              </Link>
            </li>

          </ul>

        </div>

        {/* Contact */}

        <div>

          <h3 className="text-xl font-semibold">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-slate-300">

            <div className="flex gap-3">

              <MapPin className="h-5 w-5 text-yellow-400" />

              <p>Accra, Ghana</p>

            </div>

            <div className="flex gap-3">

              <Phone className="h-5 w-5 text-yellow-400" />

              <p>+233 XX XXX XXXX</p>

            </div>

            <div className="flex gap-3">

              <Mail className="h-5 w-5 text-yellow-400" />

              <p>info@kivizhotel.com</p>

            </div>

          </div>

        </div>

        {/* Social */}

        <div>

          <h3 className="text-xl font-semibold">
            Follow Us
          </h3>

          <div className="mt-5 flex gap-4">

                <a
                    href="#"
                    className="font-medium text-yellow-400 transition hover:underline"
                >
                    Facebook coming soon
                </a>

                <a
                    href="#"
                    className="font-medium text-yellow-400 transition hover:underline"
                >
                    Instagram coming soon
                </a>

                <a
                    href="#"
                    className="font-medium text-yellow-400 transition hover:underline"
                >
                    X coming soon
                </a>

            </div>

        </div>

      </div>

      {/* Bottom Bar */}

      <div className="border-t border-slate-700 py-6 text-center text-slate-400">

        © {new Date().getFullYear()} Kiviz Executive Hotel.
        All Rights Reserved.

      </div>

    </footer>
  );
}

export default Footer;