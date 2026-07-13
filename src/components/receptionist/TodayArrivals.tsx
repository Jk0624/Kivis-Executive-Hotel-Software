function TodayArrivals() {
  return (
    <div className="mt-10 rounded-xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Today's Arrivals
      </h2>

      <table className="w-full">

        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3">Booking ID</th>
            <th className="pb-3">Guest</th>
            <th className="pb-3">Room number</th>
            <th className="pb-3">Check-in</th>
          </tr>
        </thead>

        <tbody>

          <tr className="border-b">
            <td className="py-4">BK-10245</td>
            <td>John Mensah</td>
            <td>101</td>
            <td>2:00 PM</td>
            
          </tr>

          <tr>
            <td className="py-4">BK-10246</td>
            <td>Ama Boateng</td>
            <td>103</td>
            <td>3:00 PM</td>
          </tr>

        </tbody>

      </table>

    </div>
  );
}

export default TodayArrivals;