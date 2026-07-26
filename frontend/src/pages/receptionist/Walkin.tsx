import { useEffect, useState } from "react";

import { notify } from "../../utils/notify";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import LoadingButton from "../../components/common/LoadingButton";
import api from "../../services/api";

function WalkIn() {
  const [rooms, setRooms] = useState<any[]>([]);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [creatingBooking, setCreatingBooking] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [checkInError, setCheckInError] = useState("");
  const [checkOutError, setCheckOutError] = useState("");

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const response = await api.get("/reception/rooms");

      const availableRooms = response.data.rooms.filter(
        (room: any) => room.status === "AVAILABLE"
      );

      setRooms(availableRooms);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const numberOfNights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOutDate).getTime() -
              new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const totalAmount =
    selectedRoomPrice * numberOfNights;

  const createBooking = async () => {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const trimmedEmail = email.trim();

  let hasError = false;

  setNameError("");
  setPhoneError("");
  setEmailError("");
  setRoomError("");
  setCheckInError("");
  setCheckOutError("");

  if (!trimmedName) {
    setNameError("Guest name is required.");
    hasError = true;
  }

  if (!trimmedPhone) {
    setPhoneError("Phone number is required.");
    hasError = true;
  }

  if (
    trimmedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  ) {
    setEmailError("Please enter a valid email address.");
    hasError = true;
  }

  if (!roomNo) {
    setRoomError("Please select a room.");
    hasError = true;
  }

  if (!checkInDate) {
    setCheckInError("Check-in date is required.");
    hasError = true;
  }

  if (!checkOutDate) {
    setCheckOutError("Check-out date is required.");
    hasError = true;
  }

  if (
    checkInDate &&
    checkOutDate &&
    new Date(checkOutDate) <= new Date(checkInDate)
  ) {
    setCheckOutError(
      "Check-out date must be after check-in date."
    );
    hasError = true;
  }

  if (hasError) {
    notify.error(
      "Please correct the highlighted fields."
    );
    return;
  }

  setCreatingBooking(true);

  const loadingToast = notify.loading(
    "Creating booking..."
  );

  try {
    await api.post("/reception/walk-in", {
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail || undefined,
      roomNo,
      checkInDate,
      checkOutDate,
      amount: totalAmount,
    });

    notify.dismiss(loadingToast);

    notify.success(
      "Walk-in booking created successfully."
    );

    setName("");
    setPhone("");
    setEmail("");
    setRoomNo("");
    setCheckInDate("");
    setCheckOutDate("");
    setSelectedRoomPrice(0);

    await loadRooms();
  } catch (error: any) {
    console.error(error);

    notify.dismiss(loadingToast);

    notify.error(
      error.response?.data?.message ??
        "Failed to create walk-in booking."
    );
  } finally {
    setCreatingBooking(false);
  }
};

  return (
    <ReceptionistLayout>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Walk-in Guest Registration
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
        Register guests who arrive without an online booking.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          Guest Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>

            <label
              htmlFor="guest-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <input
              id="guest-name"
              type="text"
              autoComplete="name"
              disabled={creatingBooking}
              value={name}
              aria-invalid={!!nameError}
              aria-describedby={
                nameError ? "name-error" : undefined
              }
              onChange={(e) => {
                setName(e.target.value);

                if (nameError) {
                  setNameError("");
                }
              }}
              placeholder="Enter guest's full name"
              className={`w-full rounded-lg bg-white px-4 py-3 transition outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                nameError
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {nameError && (
              <p
                id="name-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {nameError}
              </p>
            )}

          </div>

          <div>

            <label
              htmlFor="guest-phone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Phone Number
            </label>

            <input
              id="guest-phone"
              type="tel"
              autoComplete="tel"
              disabled={creatingBooking}
              value={phone}
              aria-invalid={!!phoneError}
              aria-describedby={
                phoneError ? "phone-error" : undefined
              }
              onChange={(e) => {
                setPhone(e.target.value);

                if (phoneError) {
                  setPhoneError("");
                }
              }}
              placeholder="Enter phone number"
              className={`w-full rounded-lg bg-white px-4 py-3 transition outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                phoneError
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {phoneError && (
              <p
                id="phone-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {phoneError}
              </p>
            )}

          </div>

                    <div>

            <label
              htmlFor="guest-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              id="guest-email"
              type="email"
              autoComplete="email"
              disabled={creatingBooking}
              value={email}
              aria-invalid={!!emailError}
              aria-describedby={
                emailError ? "email-error" : undefined
              }
              onChange={(e) => {
                setEmail(e.target.value);

                if (emailError) {
                  setEmailError("");
                }
              }}
              placeholder="Enter email address"
              className={`w-full rounded-lg bg-white px-4 py-3 transition outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                emailError
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {emailError && (
              <p
                id="email-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {emailError}
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Stay Information
        </h2>

        {loadingRooms ? (

          <div className="flex items-center justify-center py-10">

            <div className="text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="text-sm text-slate-500">
                Loading available rooms...
              </p>

            </div>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>

              <select
                disabled={creatingBooking}
                value={roomNo}
                aria-invalid={!!roomError}
                aria-describedby={
                  roomError ? "room-error" : undefined
                }
                onChange={(e) => {
                  const selectedRoom = rooms.find(
                    (room) =>
                      room.roomNo === e.target.value
                  );

                  setRoomNo(e.target.value);

                  setSelectedRoomPrice(
                    selectedRoom
                      ? selectedRoom.price
                      : 0
                  );

                  if (roomError) {
                    setRoomError("");
                  }
                }}
                className={`w-full rounded-lg px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  roomError
                    ? "border border-red-500 focus:border-red-500"
                    : "border border-gray-300 focus:border-blue-600"
                }`}
              >

                <option value="">
                  Select Room Number
                </option>

                {rooms.map((room) => (

                  <option
                    key={room.roomNo}
                    value={room.roomNo}
                  >
                    {room.roomNo} - {room.type} (GHS {room.price})
                  </option>

                ))}

              </select>

              {roomError && (
                <p
                  id="room-error"
                  className="mt-2 text-sm font-medium text-red-600"
                >
                  {roomError}
                </p>
              )}

            </div>

            <div>

              <input
                type="date"
                disabled={creatingBooking}
                value={checkInDate}
                aria-invalid={!!checkInError}
                aria-describedby={
                  checkInError
                    ? "checkin-error"
                    : undefined
                }
                onChange={(e) => {
                  setCheckInDate(e.target.value);

                  if (checkInError) {
                    setCheckInError("");
                  }
                }}
                className={`w-full rounded-lg px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  checkInError
                    ? "border border-red-500"
                    : "border border-gray-300"
                }`}
              />

              {checkInError && (
                <p
                  id="checkin-error"
                  className="mt-2 text-sm font-medium text-red-600"
                >
                  {checkInError}
                </p>
              )}

            </div>

            <div>

              <input
                type="date"
                disabled={creatingBooking}
                value={checkOutDate}
                aria-invalid={!!checkOutError}
                aria-describedby={
                  checkOutError
                    ? "checkout-error"
                    : undefined
                }
                onChange={(e) => {
                  setCheckOutDate(e.target.value);

                  if (checkOutError) {
                    setCheckOutError("");
                  }
                }}
                className={`w-full rounded-lg px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  checkOutError
                    ? "border border-red-500"
                    : "border border-gray-300"
                }`}
              />

              {checkOutError && (
                <p
                  id="checkout-error"
                  className="mt-2 text-sm font-medium text-red-600"
                >
                  {checkOutError}
                </p>
              )}

            </div>

          </div>

        )}
      </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

        <h2 className="mb-6 text-2xl font-semibold">
          Payment Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <select
            disabled={creatingBooking}
            className="rounded-lg border border-gray-300 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option>Cash</option>
          </select>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5">

            <h3 className="mb-3 font-semibold text-slate-800">
              Booking Summary
            </h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">

                <span>Room Rate:</span>

                <span>
                  GHS {selectedRoomPrice.toFixed(2)}
                </span>

              </div>

              <div className="flex items-center justify-between gap-4">

                <span>Number of Nights:</span>

                <span>{numberOfNights}</span>

              </div>

              <hr />

              <div className="flex items-center justify-between gap-4 text-base font-bold text-green-700 sm:text-lg">

                <span>Total Amount:</span>

                <span>
                  GHS {totalAmount.toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="mt-8 flex justify-stretch sm:justify-end">

        <LoadingButton
          type="button"
          loading={creatingBooking}
          loadingText="Creating Booking..."
          onClick={createBooking}
          className="w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 sm:w-auto sm:px-10"
        >
          Create Booking
        </LoadingButton>

      </div>

    </ReceptionistLayout>
  );
}

export default WalkIn;