import { useEffect, useState } from "react";
import { X, User, Mail, Phone, Badge } from "lucide-react";

import api from "../../services/api";
import { notify } from "../../utils/notify";
import LoadingButton from "../common/LoadingButton";

type Receptionist = {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
};

type CreateReceptionistDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  receptionist?: Receptionist | null;
};

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  employeeId?: string;
}

function CreateReceptionistDrawer({
  isOpen,
  onClose,
  onCreated,
  receptionist,
}: CreateReceptionistDrawerProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    employeeId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

    setErrors({});
  }, [receptionist, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

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

        notify.success(
          "Receptionist updated successfully."
        );
      } else {
        await api.post(
          "/admin/receptionists",
          formData
        );

        notify.success(
          "Receptionist created successfully."
        );
      }

      onCreated();

      onClose();
    } catch {
      notify.error(
        receptionist
          ? "Unable to update receptionist."
          : "Unable to create receptionist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        onClick={onClose}
        className="flex-1 bg-black/50 backdrop-blur-sm"
      />

      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              {receptionist
                ? "Edit Receptionist"
                : "Create Receptionist"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {receptionist
                ? "Update receptionist information."
                : "Create a new receptionist account."}
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>

        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Full Name */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
                className={`w-full rounded-xl border py-3 pl-11 pr-4 transition focus:outline-none focus:ring-4 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
            </div>

            {errors.name && (
              <p className="mt-2 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange("phone", e.target.value)
                }
                className={`w-full rounded-xl border py-3 pl-11 pr-4 transition focus:outline-none focus:ring-4 ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
            </div>

            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                className={`w-full rounded-xl border py-3 pl-11 pr-4 transition focus:outline-none focus:ring-4 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Employee ID */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Employee ID
            </label>

            <div className="relative">
              <Badge
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="e.g. REC003"
                value={formData.employeeId}
                onChange={(e) =>
                  handleInputChange(
                    "employeeId",
                    e.target.value
                  )
                }
                disabled={Boolean(receptionist)}
                className={`w-full rounded-xl border py-3 pl-11 pr-4 transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                  errors.employeeId
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
            </div>

            {errors.employeeId && (
              <p className="mt-2 text-sm text-red-600">
                {errors.employeeId}
              </p>
            )}
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white p-6">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <LoadingButton
            type="button"
            loading={loading}
            onClick={handleSubmit}
            className="rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white hover:bg-blue-800"
          >
            {receptionist
              ? "Save Changes"
              : "Create Receptionist"}
          </LoadingButton>

        </div>

      </div>

    </div>
  );
}

export default CreateReceptionistDrawer;