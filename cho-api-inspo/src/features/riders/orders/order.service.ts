const MAX_DISTANCE_KM = Number(process.env.RIDER_MAX_DISTANCE_KM) || 20;

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Filter orders whose restaurant is within MAX_DISTANCE_KM of the rider,
 * then sort by nearest restaurant first.
 *
 * Each order must include a `restaurant` relation with `latitude` and `longitude`.
 */
export const filterAndSortByDistance = <
  T extends {
    restaurant: { latitude: any; longitude: any };
  },
>(
  orders: T[],
  riderLat: number,
  riderLon: number,
): T[] => {
  const withDistance = orders
    .map((order) => {
      const restLat = Number(order.restaurant.latitude);
      const restLon = Number(order.restaurant.longitude);
      const distance = haversineDistance(riderLat, riderLon, restLat, restLon);
      return { order, distance };
    })
    .filter(({ distance }) => distance <= MAX_DISTANCE_KM);

  withDistance.sort((a, b) => a.distance - b.distance);

  return withDistance.map(({ order }) => order);
};
