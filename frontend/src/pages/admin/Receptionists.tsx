import { useEffect, useMemo, useState } from "react";
import LoadingButton from "../../components/common/LoadingButton";
import {
  Search,
  Users,
  UserPlus,
  Edit,
  Power,
  Phone,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import CreateReceptionistDrawer from "../../components/admin/CreateReceptionistDrawer";
import api from "../../services/api";
import { notify } from "../../utils/notify";

interface Receptionist {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

function Receptionists() {
  const [showDrawer, setShowDrawer] = useState(false);

  const [loadingReceptionists, setLoadingReceptionists] =
    useState(true);

    const [updatingReceptionistId, setUpdatingReceptionistId] =
  useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [receptionists, setReceptionists] = useState<
    Receptionist[]
  >([]);

  const [
    selectedReceptionist,
    setSelectedReceptionist,
  ] = useState<Receptionist | null>(null);

  const fetchReceptionists = async () => {
    setLoadingReceptionists(true);

    try {
      const response = await api.get("/admin/receptionists");

      setReceptionists(response.data.receptionists ?? []);
    } catch {
      notify.error("Unable to load receptionists.");
    } finally {
      setLoadingReceptionists(false);
    }
  };

  const handleToggleStatus = async (
  receptionistId: string
) => {
  setUpdatingReceptionistId(receptionistId);

  try {
    await api.patch(
      `/admin/receptionists/${receptionistId}/status`
    );

    notify.success("Receptionist status updated.");

    await fetchReceptionists();
  } catch {
    notify.error("Unable to update receptionist status.");
  } finally {
    setUpdatingReceptionistId(null);
  }
};
  useEffect(() => {
    fetchReceptionists();
  }, []);

  const filteredReceptionists = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return receptionists;

    return receptionists.filter((receptionist) =>
      [
        receptionist.employeeId,
        receptionist.name,
        receptionist.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [receptionists, searchTerm]);

  const activeReceptionists = receptionists.filter(
    (r) => r.isActive
  ).length;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Receptionists
            </h1>

            <p className="mt-2 text-gray-600">
              Manage receptionist accounts and their access.
            </p>

          </div>

          <button
            onClick={() => {
              setSelectedReceptionist(null);
              setShowDrawer(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <UserPlus size={18} />

            Create Receptionist
          </button>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-blue-100">
                  Total Receptionists
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  {receptionists.length}
                </h2>

              </div>

              <Users size={40} />

            </div>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Active Receptionists
                </p>

                <h2 className="mt-2 text-4xl font-bold text-green-600">
                  {activeReceptionists}
                </h2>

              </div>

              <Power
                size={40}
                className="text-green-600"
              />

            </div>

          </div>

        </div>

        {/* Table Card */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Receptionist Directory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search and manage receptionist accounts.
              </p>

            </div>

            <div className="relative w-full md:w-96">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search receptionist..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse">

              <thead className="sticky top-0 bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Receptionist
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Employee ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loadingReceptionists ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center gap-4">

                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                        <p className="text-sm text-gray-500">
                          Loading receptionists...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredReceptionists.length === 0 ? (

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
                        No receptionists found
                      </h3>

                      <p className="mt-2 text-gray-500">
                        No receptionist matches your search.
                      </p>

                    </td>

                  </tr>

                ) : (
                                    filteredReceptionists.map((receptionist) => (
                    <tr
                      key={receptionist.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                            {receptionist.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {receptionist.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              Receptionist
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-medium text-slate-700">
                          {receptionist.employeeId}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone
                            size={16}
                            className="text-slate-400"
                          />

                          <span>{receptionist.phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                            receptionist.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {receptionist.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceptionist(
                                receptionist
                              );
                              setShowDrawer(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                          >
                            <Edit size={16} />

                            Edit
                          </button>

                          <LoadingButton
  type="button"
  loading={updatingReceptionistId === receptionist.id}
  onClick={() =>
    handleToggleStatus(receptionist.id)
  }
  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
    receptionist.isActive
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  <Power size={16} />

  {receptionist.isActive
    ? "Deactivate"
    : "Activate"}
</LoadingButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <CreateReceptionistDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedReceptionist(null);
        }}
        onCreated={fetchReceptionists}
        receptionist={selectedReceptionist}
      />

    </AdminLayout>
  );
}

export default Receptionists;