import { useEffect, useState } from "react";
import api from "../../services/api";


type CreateReceptionistDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  receptionist?: {
    id: string;
    employeeId: string;
    name: string;
    phone: string;
    email: string;
  } | null;
};


function CreateReceptionistDrawer({
  isOpen,
  onClose,
  onCreated,
  receptionist,
}: CreateReceptionistDrawerProps) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "",
  employeeId: "",
});

useEffect(() => {
  if (receptionist) {
    setFormData({
      name: receptionist.name,
      phone: receptionist.phone,
      email: receptionist.email,
      employeeId: receptionist.employeeId,
    });
  } else {
    setFormData({
      name: "",
      phone: "",
      email: "",
      employeeId: "",
    });
  }
}, [receptionist]);

const handleCreateReceptionist = async () => {
  try {
    if (receptionist) {
      await api.patch(
        `/admin/receptionists/${receptionist.id}`,
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        }
      );

      alert("Receptionist updated successfully!");
    } else {
      await api.post("/admin/receptionists", formData);

      alert("Receptionist created successfully!");
    }

    onCreated();

    onClose();
  } catch (error) {
    console.error(error);

    alert(
      receptionist
        ? "Failed to update receptionist."
        : "Failed to create receptionist."
    );
  }
};

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* Overlay */}

      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}

      <div className="h-full w-full max-w-lg bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b p-6">

          <h2 className="text-xl font-bold">
            {receptionist ? "Edit Receptionist" : "Create Receptionist"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-black"
          >
            ×
          </button>

        </div>

        <div className="space-y-6 p-6">

          <div>

            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Phone Number
            </label>

            <input
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Employee ID
            </label>

            <input
              type="text"
              placeholder="Enter employee ID (e.g. REC003)"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  employeeId: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

        </div>

        <div className="absolute bottom-0 right-0 flex w-full max-w-lg justify-end gap-4 border-t bg-white p-6">

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-semibold text-slate-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateReceptionist}
            className="rounded-lg bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800"
          >
            {receptionist ? "Save Changes" : "Create Receptionist"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateReceptionistDrawer;