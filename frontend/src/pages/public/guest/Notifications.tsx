import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bell,
  BellRing,
  CalendarDays,
  CreditCard,
  BedDouble,
  KeyRound,
  Hand,
  Loader2,
  AlertCircle,
  RefreshCw,
  EyeOff,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import api from "../../../services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationResponse {
  message: string;
  notifications: Notification[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationIcon(title: string) {
  const value = title.toLowerCase();

  if (value.includes("payment")) {
    return (
      <CreditCard className="h-6 w-6 text-emerald-600" />
    );
  }

  if (value.includes("booking")) {
    return (
      <BedDouble className="h-6 w-6 text-blue-600" />
    );
  }

  if (value.includes("pin")) {
    return (
      <KeyRound className="h-6 w-6 text-amber-600" />
    );
  }

  if (value.includes("welcome")) {
    return (
      <Hand className="h-6 w-6 text-purple-600" />
    );
  }

  return (
    <BellRing className="h-6 w-6 text-yellow-600" />
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [hidingId, setHidingId] =
    useState<string | null>(null);

  const fetchNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<NotificationResponse>(
            "/guest/notifications"
          );

        setNotifications(
          response.data.notifications
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ??
              "Unable to load notifications."
          );
        } else {
          setError(
            "Unable to load notifications."
          );
        }
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const hideNotification =
    async (notificationId: string) => {
      try {
        setHidingId(notificationId);

        await api.patch(
          `/guest/notifications/${notificationId}/hide`
        );

        setNotifications((previous) =>
          previous.filter(
            (notification) =>
              notification.id !== notificationId
          )
        );
      } catch {
        alert(
          "Unable to hide notification."
        );
      } finally {
        setHidingId(null);
      }
    };

  const latestNotification =
    useMemo(() => {
      return notifications[0];
    }, [notifications]);

  return (
    <MainLayout>

      <div className="min-h-screen bg-slate-50">

        {/* Header */}

        <div className="border-b bg-white">

          <div className="mx-auto max-w-7xl px-6 py-10">

            <h1 className="text-4xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Stay informed about your
              bookings, payments and lodge
              updates from Kiviz Executive
              Lodge.
            </p>

          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
                      {/* Summary Cards */}

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Notifications
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {notifications.length}
                  </h2>

                </div>

                <div className="rounded-xl bg-blue-100 p-3">
                  <Bell className="h-7 w-7 text-blue-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Latest Notification
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    {latestNotification
                      ? formatDate(
                          latestNotification.createdAt
                        )
                      : "No notifications"}
                  </h2>

                </div>

                <div className="rounded-xl bg-emerald-100 p-3">
                  <CalendarDays className="h-7 w-7 text-emerald-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Active Notifications
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {notifications.length}
                  </h2>

                </div>

                <div className="rounded-xl bg-yellow-100 p-3">
                  <BellRing className="h-7 w-7 text-yellow-600" />
                </div>

              </div>

            </div>

          </div>

          {/* Loading */}

          {loading && (

            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">

              <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

              <p className="mt-6 text-lg font-medium text-slate-700">
                Loading your notifications...
              </p>

            </div>

          )}

          {/* Error */}

          {!loading && error && (

            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

              <h2 className="mt-5 text-xl font-semibold text-red-700">
                Unable to Load Notifications
              </h2>

              <p className="mt-3 text-red-600">
                {error}
              </p>

              <button
                onClick={fetchNotifications}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw className="h-5 w-5" />
                Retry
              </button>

            </div>

          )}

          {/* Empty State */}

          {!loading &&
            !error &&
            notifications.length === 0 && (

              <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center shadow-sm">

                <Bell className="mx-auto h-16 w-16 text-slate-300" />

                <h2 className="mt-6 text-2xl font-bold text-slate-800">
                  No Notifications
                </h2>

                <p className="mt-3 text-slate-500">
                  You're all caught up. There are no notifications to display.
                </p>

              </div>

            )}

          {/* Notification Cards */}

          {!loading &&
            !error &&
            notifications.length > 0 && (

              <div className="mt-10 space-y-6">

                                {notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Card Header */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">

                      <div className="flex items-start justify-between gap-6">

                        <div className="flex items-start gap-4">

                          <div className="rounded-2xl bg-white p-3 shadow-sm">

                            {getNotificationIcon(
                              notification.title
                            )}

                          </div>

                          <div>

                            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                              Notification
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                              {notification.title}
                            </h2>

                          </div>

                        </div>

                        <button
                          type="button"
                          disabled={
                            hidingId === notification.id
                          }
                          onClick={() =>
                            hideNotification(
                              notification.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {hidingId === notification.id ? (

                            <Loader2 className="h-4 w-4 animate-spin" />

                          ) : (

                            <EyeOff className="h-4 w-4" />

                          )}

                          Hide

                        </button>

                      </div>

                    </div>

                    {/* Card Body */}

                    <div className="p-8">

                      <div className="rounded-2xl bg-slate-50 p-6">

                        <p className="whitespace-pre-line text-base leading-8 text-slate-700">
                          {notification.message}
                        </p>

                      </div>

                      <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">

                        <CalendarDays className="h-5 w-5 text-yellow-500" />

                        <span>
                          {formatDate(
                            notification.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}
                              </div>

            )}

        </div>

      </div>

    </MainLayout>
  );
}