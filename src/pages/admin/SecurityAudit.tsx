import AdminLayout from "../../layouts/AdminLayout";

function SecurityAudit() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Security Audit
      </h1>

      <p className="mt-3 text-gray-600">
        Monitor important system activities performed by staff.
      </p>

      {/* Future Filters */}

      <div className="mt-8 rounded-xl bg-white p-6 shadow-md">

        <h2 className="mb-4 text-xl font-semibold">
          Filters
        </h2>

        <div className="grid gap-4 md:grid-cols-3">

          <input
            type="text"
            placeholder="Employee (Coming Soon)"
            disabled
            className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          />

          <input
            type="date"
            disabled
            className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          />

          <select
            disabled
            className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          >
            <option>Action (Coming Soon)</option>
          </select>

        </div>

      </div>

      {/* Audit Table */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Audit Logs
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Booking</th>
                <th className="p-3 text-left">Details</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-500"
                >
                  No security audit records available.
                  <br />
                  Audit events will appear here once the backend is connected.
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  );
}

export default SecurityAudit;