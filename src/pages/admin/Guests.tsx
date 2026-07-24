import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Eye, Phone, Mail } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

function Guests() {
  const navigate = useNavigate();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGuests = async () => {
    setLoadingGuests(true);

    try {
      const response = await api.get("/admin/guests");
      setGuests(response.data.guests ?? []);
    } catch {
      notify.error("Unable to load guests.");
    } finally {
      setLoadingGuests(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return guests;

    return guests.filter((guest) =>
      [guest.name, guest.email, guest.phone]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [guests, searchTerm]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Guests
            </h1>

            <p className="mt-2 text-gray-600">
              View and manage every registered guest in the hotel.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white shadow-lg">

            <Users size={34} />

            <div>

              <p className="text-sm text-blue-100">
                Total Guests
              </p>

              <p className="text-3xl font-bold">
                {guests.length}
              </p>

            </div>

          </div>

        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Guest Directory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search and view guest profiles.
              </p>

            </div>

            <div className="relative w-full md:w-96">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse">

              <thead className="sticky top-0 bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Guest
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Bookings
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {loadingGuests ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center"
                    >

                      <div className="flex flex-col items-center gap-4">

                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                        <p className="text-sm text-gray-500">
                          Loading guests...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredGuests.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <Users
                        size={52}
                        className="mx-auto mb-4 text-gray-300"
                      />

                      <h3 className="text-lg font-semibold text-slate-800">
                        No guests found
                      </h3>

                      <p className="mt-2 text-gray-500">
                        No guests match your search criteria.
                      </p>

                    </td>

                  </tr>

                ) : (
                                    filteredGuests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                            {guest.name
                              ?.split(" ")
                              .map((word) => word[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {guest.name}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                guest.isVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {guest.isVerified
                                ? "Verified"
                                : "Not Verified"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone size={16} className="text-slate-400" />

                          <span>{guest.phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail size={16} className="text-slate-400" />

                          <span>{guest.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {guest._count.bookings}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/guests/${guest.id}`)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                        >
                          <Eye size={16} />

                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Guests;