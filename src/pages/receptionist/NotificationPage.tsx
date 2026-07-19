import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useEffect, useState } from "react";
import api from "../../services/api";


function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/reception");
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);


  const hideNotification = async (id: string) => {
  try {
    await api.patch(`/notifications/${id}/hide`);

    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  } catch (error) {
    console.error("Failed to hide notification:", error);
  }
};


  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Notifications
      </h1>

      <p className="mt-3 text-gray-600">
        View all system notifications.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Notification History
        </h2>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="relative rounded-lg border p-4"
            >
              <button
                onClick={() => hideNotification(notification.id)}
                className="absolute right-3 top-3 text-xl font-bold text-gray-400 transition-colors hover:text-red-600"
                title="Hide notification"
              >
                ×
              </button>

              <p className="font-semibold">
                {notification.title}
              </p>

              <p className="mt-1 text-gray-700">
                {notification.message}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

      </div>

    </ReceptionistLayout>
  );
}

export default Notifications;