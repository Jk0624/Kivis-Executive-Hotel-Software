import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";


function Guests() {
    const navigate = useNavigate();
    const [guests, setGuests] = useState<any[]>([]);

    const fetchGuests = async () => {
      try {
        const response = await api.get("/admin/guests");
        setGuests(response.data.guests);
      } catch (error) {
        console.error("Failed to fetch guests:", error);
      }
    };

useEffect(() => {
  fetchGuests();
}, []);
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Guests
      </h1>

      <p className="mt-3 text-gray-600">
        View and manage all hotel guests.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guests
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Guest</th>

                <th className="p-3 text-left">Phone</th>

                <th className="p-3 text-left">Email</th>

                <th className="p-3 text-left">Bookings</th>

                <th className="p-3 text-left">Action</th>

              </tr>

            </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b">
                      <td className="p-3">{guest.name}</td>

                      <td className="p-3">{guest.phone}</td>

                      <td className="p-3">{guest.email}</td>

                      <td className="p-3">{guest._count.bookings}</td>

                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/admin/guests/${guest.id}`)}
                          className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Guests;