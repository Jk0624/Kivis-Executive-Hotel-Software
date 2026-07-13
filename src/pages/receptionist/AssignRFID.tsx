import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function AssignRFID() {
  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
  Room RFID Assignment
</h1>

<p className="mt-3 text-gray-600">
  Assign RFID cards to hotel rooms.
</p>

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Card Assignment
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <select className="rounded-lg border border-gray-300 px-4 py-3">
      <option>Select RFID Card</option>

      {/* These RFID UID will come from the backend */}
      <option>24:61:DF:00</option>
      <option>E3:D7:02:01</option>
      <option>ED:99:06:32</option>
    </select>

    <select className="rounded-lg border border-gray-300 px-4 py-3">
      <option>Select Room</option>

      {/* These room options will come from the backend */}
      <option>101 - Executive Room</option>
      <option>102 - Executive Room</option>
      <option>201 - Deluxe Room</option>
    </select>

  </div>

  <div className="mt-8 flex justify-end">

    <button className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
      Assign Card
    </button>

  </div>

</div>

    </ReceptionistLayout>
  );
}

export default AssignRFID;