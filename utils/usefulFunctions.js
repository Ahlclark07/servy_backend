const { DateTime } = require("luxon");

exports.formatDate = function (date) {
  return DateTime.fromJSDate(date)
    .setLocale("fr")
    .toLocaleString(DateTime.DATE_FULL);
};
