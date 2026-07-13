type DeleteDeviceModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteDeviceModal({
  isOpen,
  onCancel,
  onConfirm,
}: DeleteDeviceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

        <h2 className="text-2xl font-bold text-red-700">
          Delete Device
        </h2>

        <p className="mt-4 text-gray-600">
          Are you sure you want to delete this ESP32 device?
        </p>

        <p className="mt-2 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-700 px-6 py-2 font-semibold text-white hover:bg-red-800"
          >
            Delete Device
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteDeviceModal;