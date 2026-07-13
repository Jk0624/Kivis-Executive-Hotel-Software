import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function WalkIn() {
  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Walk-in Guest Registration
      </h1>

      <p className="mt-3 text-gray-600">
        Register guests who arrive without an online booking.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8    shadow-md">

            <h2 className="mb-6 text-2xl font-semibold">
            Guest Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter guest's full name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Phone Number"
                    className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    className="rounded-lg border border-gray-300 px-4 py-3"
                />

                {/*
                <input
                    type="text"
                    placeholder="Nationality"
                    className="rounded-lg border border-gray-300 px-4 py-3"
                />
                */}

            </div>

        </div>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Stay Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <select className="rounded-lg border border-gray-300 px-4 py-3">
        <option>Select Room Number</option>
        <option>101 - Executive Room</option>
        <option>102 - Executive Room</option>
        <option>201 - Deluxe Room</option>
        <option>301 - Standard Room</option>
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
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="date"
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

    <input
      type="number"
      placeholder="Amount Paid (GHS)"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    

  </div>

</div>


<div className="mt-8 flex justify-end">

  <button className="rounded-lg bg-green-700 px-10 py-3 font-semibold text-white transition hover:bg-green-800">
    Create Booking
  </button>

</div>

    </ReceptionistLayout>
  );
}

export default WalkIn;