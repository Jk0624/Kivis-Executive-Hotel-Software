import { useEffect, useState } from "react";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";

function WalkIn() {

  const [rooms, setRooms] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get("/reception/rooms");

        const availableRooms = response.data.rooms.filter(
          (room: any) => room.status === "AVAILABLE"
        );

        setRooms(availableRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };

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

const totalAmount = selectedRoomPrice * numberOfNights;


  const createBooking = async () => {
  try {
    const response = await api.post("/reception/walk-in", {
      name,
      phone,
      email: email || undefined,
      roomNo,
      checkInDate,
      checkOutDate,
      amount: totalAmount, 
    });

    alert(response.data.message);

    setName("");
    setPhone("");
    setEmail("");
    setRoomNo("");
    setCheckInDate("");
    setCheckOutDate("");
    setSelectedRoomPrice(0);

    // Reload available rooms
    const roomsResponse = await api.get("/reception/rooms");

    const availableRooms = roomsResponse.data.rooms.filter(
      (room: any) => room.status === "AVAILABLE"
    );

    setRooms(availableRooms);
  } catch (error: any) {
    alert(
      error.response?.data?.message ||
        "Failed to create walk-in booking."
    );
  }
};





  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Walk-in Guest Registration
      </h1>

      <p className="mt-3 text-gray-600">
        Register guests who arrive without an online booking.
      </p>

<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

  <h2 className="mb-6 text-2xl font-semibold text-slate-900">
    Guest Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

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
        placeholder="Enter guest's full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
      />
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
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
      />
    </div>

    <div>
      <label
        htmlFor="guest-email"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Email Address
        <span className="ml-1 text-slate-400 font-normal">
          (Optional)
        </span>
      </label>

      <input
        id="guest-email"
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
      />
    </div>

  </div>

</div>



        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Stay Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

  <select
  value={roomNo}
  onChange={(e) => {
    const selectedRoom = rooms.find(
      (room) => room.roomNo === e.target.value
    );

    setRoomNo(e.target.value);
    setSelectedRoomPrice(selectedRoom ? selectedRoom.price : 0);
  }}
  className="rounded-lg border border-gray-300 px-4 py-3"
  >
    <option value="">Select Room Number</option>

    {rooms.map((room) => (
      <option key={room.roomNo} value={room.roomNo}>
        {room.roomNo} - {room.type} (GHS {room.price})
      </option>
    ))}
  </select>

    {/*
    <input
      type="number"
      placeholder="Number of Guests"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />
    */}

    <input
      type="date"
      value={checkInDate}
      onChange={(e) => setCheckInDate(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="date"
      value={checkOutDate}
      onChange={(e) => setCheckOutDate(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

  </div>

  

</div>


<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Payment Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <select className="rounded-lg border border-gray-300 px-4 py-3">
      <option>Select Payment Method</option>
      <option>Cash</option>
      {/* Future Payment Methods */}
      {/* <option>Mobile Money</option> */}
      {/*<option>Debit/Credit Card</option>*/}
    </select>

    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
  <h3 className="mb-3 font-semibold text-slate-800">
    Booking Summary
  </h3>

  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Room Rate:</span>
      <span>GHS {selectedRoomPrice.toFixed(2)}</span>
    </div>

    <div className="flex justify-between">
      <span>Number of Nights:</span>
      <span>{numberOfNights}</span>
    </div>

    <hr />

    <div className="flex justify-between text-lg font-bold text-green-700">
      <span>Total Amount:</span>
      <span>GHS {totalAmount.toFixed(2)}</span>
    </div>
  </div>
</div>

    

  </div>

</div>


<div className="mt-8 flex justify-end">

  <button
    onClick={createBooking}
    className="rounded-lg bg-green-700 px-10 py-3 font-semibold text-white transition hover:bg-green-800"
  >
    Create Booking
  </button>

</div>

    </ReceptionistLayout>
  );
}

export default WalkIn;