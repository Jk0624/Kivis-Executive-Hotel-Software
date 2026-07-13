type CreateReceptionistDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function CreateReceptionistDrawer({
  isOpen,
  onClose,
}: CreateReceptionistDrawerProps) {
  if (!isOpen) return null;

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

          <h2 className="text-2xl font-bold text-slate-900">
            Create Receptionist
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

          <button className="rounded-lg bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800">
            Create Receptionist
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateReceptionistDrawer;