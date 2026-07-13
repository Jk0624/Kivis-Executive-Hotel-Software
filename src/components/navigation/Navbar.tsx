import { Link } from "react-router-dom";
import { Hotel } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="flex items-center gap-2">
        <Hotel className="w-8 h-8 text-yellow-500" />

        <h2 className="text-2xl font-bold text-blue-900">
          Kivis Executive Hotel
        </h2>
      </div>

      <ul className="flex items-center gap-6">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/rooms">Rooms</Link>
        </li>

        <li>Gallery</li>

        <li>About</li>

        <li>Contact</li>

        <li>Staff Login</li>
      </ul>
    </nav>
  );
}

export default Navbar;