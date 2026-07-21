import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import CreateReceptionistDrawer from "../../components/admin/CreateReceptionistDrawer";
import api from "../../services/api";

function Receptionists() {
    const [showDrawer, setShowDrawer] = useState(false);
    const [receptionists, setReceptionists] = useState<any[]>([]);
    const [selectedReceptionist, setSelectedReceptionist] = useState<any>(null);


const fetchReceptionists = async () => {
  try {
    const response = await api.get("/admin/receptionists");
    setReceptionists(response.data.receptionists);
  } catch (error) {
    console.error("Failed to fetch receptionists:", error);
  }
};


const handleToggleStatus = async (receptionistId: string) => {
  try {
    await api.patch(
      `/admin/receptionists/${receptionistId}/status`
    );

    fetchReceptionists();
  } catch (error) {
    console.error(
      "Failed to update receptionist status:",
      error
    );
  }
};

useEffect(() => {
  fetchReceptionists();
}, []);

  return (
    <AdminLayout>

      <div className="flex items-center justify-between"> 

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Receptionists
          </h1>

          <p className="mt-2 text-gray-600">
            Manage receptionist accounts.
          </p>

        </div>

        <button
          onClick={() => {
          setSelectedReceptionist(null);
          setShowDrawer(true);
        }}
        className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
        + Create Receptionist
        </button>

      </div>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Employee ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              {receptionists.map((receptionist) => (
  <tr key={receptionist.id} className="border-b">
    <td className="p-3">
      {receptionist.employeeId}
    </td>

    <td className="p-3">
      {receptionist.name}
    </td>

    <td className="p-3">
      {receptionist.phone}
    </td>

    <td className="p-3">
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          receptionist.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {receptionist.isActive ? "Active" : "Inactive"}
      </span>
    </td>

    <td className="p-3">
  <div className="flex gap-2">
    <button
  onClick={() => {
    setSelectedReceptionist(receptionist);
    setShowDrawer(true);
  }}
  className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
>
  Edit
</button>

    <button
  onClick={() => handleToggleStatus(receptionist.id)}
  className={`rounded-lg px-4 py-2 text-white ${ 
    receptionist.isActive
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {receptionist.isActive ? "Deactivate" : "Activate"}
</button>
  </div>
</td>
  </tr>
))}

            </tbody>

          </table>

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