// ==========================================
// NORMALIZE HOTEL BOOKING DATES
// ==========================================
export function applyHotelBookingTimes(
  checkIn: Date,
  checkOut: Date,
) {

  const normalizedCheckIn =
    new Date(checkIn);

  normalizedCheckIn.setHours(
    14,
    0,
    0,
    0,
  );

  const normalizedCheckOut =
    new Date(checkOut);

  normalizedCheckOut.setHours(
    12,
    0,
    0,
    0,
  );

  return {
    checkIn: normalizedCheckIn,
    checkOut: normalizedCheckOut,
  };
}