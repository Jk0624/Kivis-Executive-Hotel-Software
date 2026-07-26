import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  ShieldCheck,
  UserCircle2,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

interface Profile {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function Profile() {
  const [profile, setProfile] = useState<Profile | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/profile");

      setProfile(response.data.user);
    } catch {
      notify.error(
        "Unable to load profile information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AdminLayout>

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-slate-600">
          View your administrator account information.
        </p>

      </div>

      {loading ? (
        <div className="space-y-6">

          <div className="h-52 animate-pulse rounded-3xl bg-slate-200" />

          <div className="grid gap-6 lg:grid-cols-2">

            <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />

            <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />

          </div>

        </div>
      ) : !profile ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">

          <h2 className="text-xl font-semibold text-red-700">
            Unable to load profile.
          </h2>

          <p className="mt-2 text-red-600">
            Please refresh the page and try again.
          </p>

        </div>
      ) : (

        <>
          {/* Hero Card */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="h-24 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

            <div className="-mt-12 flex flex-col items-center px-8 pb-8">

              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg">

                {profile.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}

              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-slate-500">
                {profile.employeeId ??
                  "Administrator"}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

                <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                  {profile.role}
                </span>

                <span
                  className={`rounded-full px-4 py-1 text-sm font-semibold ${
                    profile.isActive === false
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {profile.isActive === false
                    ? "Inactive"
                    : "Active"}
                </span>

              </div>

            </div>

          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

                        {/* Personal Information */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-3">

                <UserCircle2 className="text-blue-700" size={26} />

                <h3 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h3>

              </div>

              <div className="space-y-6">

                <div className="flex items-start gap-4">

                  <UserCircle2
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Full Name
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.name}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <Mail
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Email Address
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.email}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <Phone
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Phone Number
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.phone}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <BadgeCheck
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Employee ID
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.employeeId ?? "Not Assigned"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Account Information */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-3">

                <ShieldCheck
                  className="text-emerald-600"
                  size={26}
                />

                <h3 className="text-xl font-bold text-slate-900">
                  Account Information
                </h3>

              </div>

              <div className="space-y-6">

                <div className="flex items-start gap-4">

                  <ShieldCheck
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Role
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.role}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <BadgeCheck
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Account Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        profile.isActive === false
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {profile.isActive === false
                        ? "Inactive"
                        : "Active"}
                    </span>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <CalendarDays
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Member Since
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.createdAt
                        ? new Date(
                            profile.createdAt
                          ).toLocaleDateString()
                        : "Not Available"}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <CalendarDays
                    size={20}
                    className="mt-1 text-slate-400"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Last Updated
                    </p>

                    <p className="font-semibold text-slate-900">
                      {profile.updatedAt
                        ? new Date(
                            profile.updatedAt
                          ).toLocaleString()
                        : "Not Available"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </>

      )}

    </AdminLayout>
  );
}

export default Profile;