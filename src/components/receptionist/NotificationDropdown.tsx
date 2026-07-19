type NotificationDropdownProps = {
  notifications: {
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }[];
  onClose: () => void;
};



function NotificationDropdown({
  notifications,
  onClose,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-14 z-50 w-96 rounded-xl bg-white shadow-xl border border-gray-200">

      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Notifications
        </h2>

        <button
          onClick={onClose}
          className="text-xl font-bold text-gray-400 transition-colors hover:text-red-600"
          title="Close"
        >
          ×
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
  {notifications.length === 0 ? (
    <div className="px-5 py-4 text-center text-gray-500">
      No recent notifications.
    </div>
  ) : (
    notifications.map((notification) => (
      <div
        key={notification.id}
        className="border-b px-5 py-4 hover:bg-slate-50"
      >
        <p className="font-medium text-slate-900">
          {notification.title}
        </p>

        <p className="mt-1 text-sm text-gray-700">
          {notification.message}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    ))
  )}
</div>

    </div>
  );
}

export default NotificationDropdown;