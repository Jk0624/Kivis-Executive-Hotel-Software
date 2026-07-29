import axios from "axios";

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DistanceResult = {
  distanceKm: number;
  source: "google" | "haversine";
};

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

const getGoogleMapsApiKey = (): string | undefined =>
process.env.GOOGLE_MAPS_API_KEY;

const getGoogleRoutesTimeoutMs = (): number => {
  const value = Number(process.env.GOOGLE_ROUTES_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : 3000;
};

const calculateGoogleRouteDistanceKm = async (
  origin: Coordinates,
  destination: Coordinates,
): Promise<number | null> => {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) return null;

  try {
    const response = await axios.post(
      GOOGLE_ROUTES_URL,
      {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
      },
      {
        timeout: getGoogleRoutesTimeoutMs(),
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters",
        },
      },
    );

    const distanceMeters = response.data?.routes?.[0]?.distanceMeters;
    if (typeof distanceMeters !== "number" || distanceMeters <= 0) {
      return null;
    }

    return distanceMeters / 1000;
  } catch (error) {
    console.warn(
      "Google route distance failed; falling back to Haversine:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};

/**
 * Prefer Google road distance, then fall back to Haversine when the API key is
 * missing, the request fails, or Google returns no usable route.
 */
export const calculateBestDistance = async (
  origin: Coordinates,
  destination: Coordinates,
): Promise<DistanceResult> => {
  const googleDistanceKm = await calculateGoogleRouteDistanceKm(origin, destination);

  if (googleDistanceKm !== null) {
    return {
      distanceKm: googleDistanceKm,
      source: "google",
    };
  }

  const haversineDistanceKm = calculateHaversineDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  return {
    distanceKm: haversineDistanceKm,
    source: "haversine",
  };
};
