// ==========================================
// CALCULATE NUMBER OF NIGHTS
// ==========================================
export function calculateNumberOfNights(
  checkIn: Date,
  checkOut: Date,
) {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (checkOut.getTime() -
      checkIn.getTime()) /
      millisecondsPerDay,
  );
}

// ==========================================
// CALCULATE BOOKING AMOUNT
// ==========================================
export function calculateBookingAmount(
  roomPrice: number,
  checkIn: Date,
  checkOut: Date,
) {
  const nights =
    calculateNumberOfNights(
      checkIn,
      checkOut,
    );

  return {
    nightlyRate: roomPrice,
    nights,
    totalAmount:
      nights * roomPrice,
  };
}