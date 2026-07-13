import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useNavigate } from "react-router-dom";

function Rooms() {
    const navigate = useNavigate();
  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Rooms
      </h1>

      <p className="mt-3 text-gray-600">
        View all hotel rooms,their prices and current status.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

  {/* Room Card */}

  <div className="rounded-xl bg-white p-5 shadow-md">

  <h2 className="text-xl font-bold text-slate-900">
    Room 101
  </h2>

  <p className="mt-1 text-gray-600">
    Executive Room
  </p>

  <p className="mt-2 text-lg font-semibold">
    GHS 350 / Night
  </p>

  <div className="mt-3 flex justify-center">

    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
      Available
    </span>

  </div>

  <div className="mt-5 flex justify-center">

    <button
  onClick={() => navigate("/receptionist/rooms/101")}
  className="rounded-lg bg-blue-700 px-8 py-2 font-semibold text-white hover:bg-blue-800"
>
  View
</button>

  </div>

</div>


{/* Room 102 */}

<div className="rounded-xl bg-white p-5 shadow-md">

  <h2 className="text-xl font-bold text-slate-900">
    Room 102
  </h2>

  <p className="mt-1 text-gray-600">
    Executive Room
  </p>

  <p className="mt-2 text-lg font-semibold">
    💰 GHS 350 / Night
  </p>

  <div className="mt-3 flex justify-center">

    <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
      Occupied
    </span>

  </div>

  <div className="mt-5 flex justify-center">

    <button className="rounded-lg bg-blue-700 px-8 py-2 font-semibold text-white hover:bg-blue-800">
      View
    </button>

  </div>

</div>

{/* Room 201 */}

<div className="rounded-xl bg-white p-5 shadow-md">

  <h2 className="text-xl font-bold text-slate-900">
    Room 201
  </h2>

  <p className="mt-1 text-gray-600">
    Deluxe Room
  </p>

  <p className="mt-2 text-lg font-semibold">
    💰 GHS 450 / Night
  </p>

  <div className="mt-3 flex justify-center">

    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
      Reserved
    </span>

  </div>

  <div className="mt-5 flex justify-center">

    <button className="rounded-lg bg-blue-700 px-8 py-2 font-semibold text-white hover:bg-blue-800">
      View
    </button>

  </div>

</div>

{/* Room 301 */}

<div className="rounded-xl bg-white p-5 shadow-md">

  <h2 className="text-xl font-bold text-slate-900">
    Room 301
  </h2>

  <p className="mt-1 text-gray-600">
    Standard Room
  </p>

  <p className="mt-2 text-lg font-semibold">
    💰 GHS 250 / Night
  </p>

  <div className="mt-3 flex justify-center">

    <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
      Maintenance
    </span>

  </div>

  <div className="mt-5 flex justify-center">

    <button className="rounded-lg bg-blue-700 px-8 py-2 font-semibold text-white hover:bg-blue-800">
      View
    </button>

  </div>

</div>

</div>
</div>

    </ReceptionistLayout>
  );
}

export default Rooms;