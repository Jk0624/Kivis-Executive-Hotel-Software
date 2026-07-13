import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import toast from "react-hot-toast";

function BookingExtension() {
  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Booking Extension
      </h1>

      <p className="mt-3 text-gray-600">
        Extend the stay of a checked-in guest.
      </p>

      {/* Search Card */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Search Checked-In Guest
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Enter guest's phone number"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
          />

          <button className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
            Search
          </button>

        </div>

      </div>


      {/* Booking Details */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
            Booking Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

            <p><strong>Booking ID:</strong> BK-202600125</p>

            <p><strong>Guest Name:</strong> John Mensah</p>

            <p><strong>Phone Number:</strong> 0241234567</p>

            <p><strong>Room:</strong> 101 - Executive Room</p>

            <p><strong>Current Check-in:</strong> 20 July 2026</p>

            <p><strong>Current Check-out:</strong> 23 July 2026</p>

            <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-green-600">
                Checked In
            </span>
            </p>

        </div>

     </div>


     {/* Extension Details */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Extension Details
  </h2>

  <div>
  <label className="mb-2 block font-medium">
    New Check-out Date
  </label>

  <div className="flex items-end gap-4">

    <input
      type="date"
      className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
    />

    <button className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
      Preview Extension
    </button>

  </div>
</div>

</div>

{/* Extension Preview */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Extension Preview
  </h2>

  <div className="grid gap-6 md:grid-cols-3">

    <div className="rounded-lg bg-slate-100 p-6 text-center">

      <h3 className="text-lg font-semibold">
        Nightly Rate
      </h3>

      <p className="mt-3 text-3xl font-bold text-blue-700">
        GHS 350
      </p>

    </div>

    <div className="rounded-lg bg-slate-100 p-6 text-center">

      <h3 className="text-lg font-semibold">
        Additional Nights
      </h3>

      <p className="mt-3 text-3xl font-bold text-blue-700">
        2
      </p>

    </div>

    <div className="rounded-lg bg-slate-100 p-6 text-center">

      <h3 className="text-lg font-semibold">
        Additional Amount
      </h3>

      <p className="mt-3 text-3xl font-bold text-green-700">
        GHS 700
      </p>

    </div>

  </div>

</div>


{/* Confirm Extension */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Confirm Extension
  </h2>

  <div>

  <label className="mb-2 block font-medium">
    Payment Method
  </label>

  <div className="flex items-end gap-4">

    <select className="flex-1 rounded-lg border border-gray-300 px-4 py-3">

      <option>Cash</option>

      {/* Future Payment Methods */}

      {/* <option>Mobile Money</option> */}

      {/* <option>Debit/Credit Card</option> */}

    </select>

    <button
  onClick={() =>
    toast.success("Booking Extended Successfully")
  }
  className="rounded-lg bg-green-700 px-8 py-3 font-semibold text-white hover:bg-green-800"
>
  Confirm Extension
</button>

  </div>

</div>
</div>

    </ReceptionistLayout>
  );
}

export default BookingExtension;