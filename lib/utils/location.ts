export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

export function isValidCoordinates(
  coordinates?: PropertyCoordinates | null
): coordinates is PropertyCoordinates {
  if (!coordinates) return false;
  const { latitude, longitude } = coordinates;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function formatCoordinates(
  coordinates?: PropertyCoordinates | null,
  digits = 6
): string {
  if (!isValidCoordinates(coordinates)) return "";
  return `${coordinates.latitude.toFixed(digits)}, ${coordinates.longitude.toFixed(digits)}`;
}

export function getOpenStreetMapUrl(
  coordinates?: PropertyCoordinates | null,
  zoom = 16
): string {
  if (!isValidCoordinates(coordinates)) return "";
  const lat = coordinates.latitude.toFixed(6);
  const lon = coordinates.longitude.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

export function getOpenStreetMapDirectionsUrl(from: PropertyCoordinates, to: PropertyCoordinates): string {
  const route = `${from.latitude},${from.longitude};${to.latitude},${to.longitude}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`;
}
