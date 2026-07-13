import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function RoomDetails() {
  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Room Details
      </h1>

      <p className="mt-3 text-gray-600">
        View detailed information about the selected room.
      </p>

      {/* Room Information */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Room Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <p><strong>Room Number:</strong> 101</p>

    <p><strong>Room Type:</strong> Executive Room</p>

    <p><strong>Price:</strong> GHS 350 / Night</p>

    <p>
      <strong>Status:</strong>{" "}
      <span className="font-semibold text-green-600">
        Available
      </span>
    </p>

  </div>

</div>

{/* Smart Access */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Smart Access
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <p><strong>Assigned RFID:</strong> 24:61:DF:00</p>

    <p>
      <strong>RFID Status:</strong>{" "}
      <span className="font-semibold text-green-600">
        Active
      </span>
    </p>

    <p>
      <strong>Door Lock:</strong>{" "}
      <span className="font-semibold text-green-600">
        Online
      </span>
    </p>

    <p>
      <strong>PIN Access:</strong>{" "}
      <span className="font-semibold text-green-600">
        Enabled
      </span>
    </p>

  </div>

</div>

    </ReceptionistLayout>
  );
}

export default RoomDetails;