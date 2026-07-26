import { useEffect, useState } from "react";

import axios from "axios";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../services/api";
import UserAvatar from "../../../components/navigation/UserAvatar";
import {
  Mail,
  Phone,
  Shield,
  User,
  Pencil,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ProfileResponse {
  message: string;
  user: UserProfile;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<ProfileResponse>("/profile");

      setProfile(response.data.user);

      setFormData({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
      });

      setError("");
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
        
      setError(
        error?.response?.data?.message ||
          "Unable to load your profile."
      );
       } else {
         setError("Unable to load your profile.");
  }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };


  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);

    setError("");

    setSuccess("");

    try {
      const isProfileComplete =
        profile.name &&
        profile.name.trim() !== "" &&
        profile.email &&
        profile.email.trim() !== "";

      if (isProfileComplete) {
        await api.patch("/profile", formData);
      } else {
        await api.post(
          "/profile/complete",
          formData
        );
      }

      setSuccess(
        "Your profile has been updated successfully."
      );

      setEditing(false);

      await fetchProfile();
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    setError(
      error.response?.data?.message ??
      "Unable to save profile."
    );
  } else {
    setError("Unable to save profile.");
  }
}
      finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <section className="flex min-h-[70vh] items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-5">

            <Loader2 className="h-10 w-10 animate-spin text-blue-700" />

            <p className="text-lg font-medium text-slate-600">
              Loading your profile...
            </p>

          </div>
        </section>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">

          <div className="max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">

            <AlertCircle className="mx-auto h-14 w-14 text-red-500" />

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              Unable to load profile
            </h2>

            <p className="mt-3 text-slate-600">
              {error || "Something went wrong."}
            </p>

            <button
              onClick={fetchProfile}
              className="mt-8 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Try Again
            </button>

          </div>

        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">

          <div className="mb-10">

            <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
              Guest Portal
            </p>

            <h1 className="mt-3 text-5xl font-bold text-slate-900">
              My Profile
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              View and manage your personal information
              used for reservations and communication.
            </p>

          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

              <AlertCircle className="h-5 w-5" />

              <span>{error}</span>

            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">

              <CheckCircle2 className="h-5 w-5" />

              <span>{success}</span>

            </div>
          )}

          <div className="rounded-3xl bg-white shadow-xl">

                      <div className="border-b border-slate-200 px-10 py-10">

              <div className="flex flex-col items-center justify-between gap-8 md:flex-row">

                <div className="flex items-center gap-6">

                  <UserAvatar
                    name={profile.name || "Guest"}
                  />

                  <div>

                    <h2 className="text-3xl font-bold text-slate-900">
                      {profile.name || "Guest"}
                    </h2>

                    <p className="mt-2 text-slate-500">
                      Welcome back to Kiviz Executive Lodge
                    </p>

                    <div className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                      {profile.role}
                    </div>

                  </div>

                </div>

                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-800"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(false);

                      setFormData({
                        name: profile.name || "",
                        email: profile.email || "",
                      });

                      setError("");
                    }}
                    className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-8 p-10 md:grid-cols-2"
            >

              {/* Name */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <User className="h-4 w-4 text-blue-700" />

                  Full Name

                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    editing
                      ? "border-slate-300 bg-white focus:border-blue-700"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                />

              </div>

              {/* Email */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <Mail className="h-4 w-4 text-blue-700" />

                  Email Address

                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    editing
                      ? "border-slate-300 bg-white focus:border-blue-700"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                />

              </div>

              {/* Phone */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <Phone className="h-4 w-4 text-blue-700" />

                  Phone Number

                </label>

                <input
                  type="text"
                  value={profile.phone || "Not Available"}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                />

              </div>

              {/* Role */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <Shield className="h-4 w-4 text-blue-700" />

                  Account Role

                </label>

                <input
                  type="text"
                  value={profile.role}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                />

              </div>

              {editing && (
                <div className="flex justify-end pt-4 md:col-span-2">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}

                  </button>

                </div>
              )}

            </form>

          </div>

        </div>

      </section>

            

    </MainLayout>
  );
}