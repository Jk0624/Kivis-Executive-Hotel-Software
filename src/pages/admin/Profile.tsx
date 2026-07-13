import AdminLayout from "../../layouts/AdminLayout";

function Profile() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Profile
      </h1>

      <p className="mt-3 text-gray-600">
        View administrator account information.
      </p>

      {/* Profile Card */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <div className="flex flex-col items-center">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl">
            👤
          </div>

          <h2 className="mt-4 text-2xl font-bold">
            Administrator
          </h2>

          <p className="text-gray-500">
            ADM001
          </p>

        </div>

      </div>

      {/* Profile Details */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <div className="grid gap-6 md:grid-cols-2">

          <p>
            <strong>Employee ID:</strong> ADM001
          </p>

          <p>
            <strong>Name:</strong> Richard Asare
          </p>

          <p>
            <strong>Phone:</strong> 0241234567
          </p>

          <p>
            <strong>Email:</strong> admin@kiviz.com
          </p>

          <p>
            <strong>Role:</strong> Administrator
          </p>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Profile;