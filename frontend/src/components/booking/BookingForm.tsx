import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../../services/api";

interface BookingFormProps {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  setCheckInDate: React.Dispatch<React.SetStateAction<string>>;
  setCheckOutDate: React.Dispatch<React.SetStateAction<string>>;
}

function BookingForm({
  roomId,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
}: BookingFormProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function handleBooking() {
    setError("");
    setSuccess("");

    if (!checkInDate || !checkOutDate) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/guest/bookings", {
        roomId,
        checkInDate,
        checkOutDate,
      });

      setSuccess(
        response.data.message ??
          "Booking created successfully."
      );

      setTimeout(() => {
        navigate("/guest/bookings");
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Unable to create booking."
        );
      } else {
        setError("Unable to create booking.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900">
        Reservation Details
      </h2>

      <p className="mt-2 text-slate-600">
        Select your preferred stay dates.
      </p>

      <div className="mt-8 space-y-6">

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Check-in Date
          </label>

          <input
            type="date"
            min={today}
            value={checkInDate}
            onChange={(e) =>
              setCheckInDate(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Check-out Date
          </label>

          <input
            type="date"
            min={checkInDate || today}
            value={checkOutDate}
            onChange={(e) =>
              setCheckOutDate(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500"
          />
        </div>

      </div>

      <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

        <h3 className="font-semibold text-slate-900">
          Important Information
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• Check-in starts at 2:00 PM.</li>
          <li>• Check-out is before 12:00 PM.</li>
          <li>• Payment is required to confirm your reservation.</li>
        </ul>

      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={handleBooking}
        className="mt-10 flex w-full items-center justify-center rounded-xl bg-yellow-500 px-6 py-4 text-lg font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Booking...
          </>
        ) : (
          "Confirm Reservation"
        )}
      </button>
    </div>
  );
}

export default BookingForm;