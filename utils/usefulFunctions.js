const { DateTime } = require("luxon");

exports.formatDate = function (date) {
  return DateTime.fromJSDate(date)
    .setLocale("fr")
    .toLocaleString(DateTime.DATE_FULL);
};
function haversineDistance(coords1, coords2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const lat1 = (coords1.lat * Math.PI) / 180; // Conversion en radians
  const lat2 = (coords2.lat * Math.PI) / 180;
  const deltaLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const deltaLong = ((coords2.long - coords1.long) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLong / 2) *
      Math.sin(deltaLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance en mètres
  return distance;
}

exports.getCoords = function (localisation) {
  return localisation.split(" | ").map(Number);
};
exports.sortVendorsByProximity = function (vendors, userCoords) {
  return vendors.sort((a, b) => {
    const distanceA = haversineDistance(userCoords, a.coords);
    const distanceB = haversineDistance(userCoords, b.coords);

    return distanceA - distanceB;
  });
};
