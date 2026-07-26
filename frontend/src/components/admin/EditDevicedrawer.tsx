type EditDeviceDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function EditDeviceDrawer({
  isOpen,
  onClose,
}: EditDeviceDrawerProps) {
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

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Edit Access Device
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the room assignment or MAC address.
            </p>

          </div>

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
              Room
            </label>

            <select className="w-full rounded-lg border border-gray-300 px-4 py-3">

              <option>K101</option>
              <option>K102</option>
              <option>K103</option>

            </select>

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              MAC Address
            </label>

            <input
              type="text"
              defaultValue="24:6F:28:AB:CD:EF"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

          </div>

        </div>

        <div className="absolute bottom-0 right-0 flex w-full max-w-lg justify-end gap-4 border-t bg-white p-6">

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold"
          >
            Cancel
          </button>

          <button className="rounded-lg bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800">
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditDeviceDrawer;