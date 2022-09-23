class_name TimeFormatter

enum Format { SECONDS = 0b0001, MINUTES = 0b0010, HOURS = 0b0100, DAYS = 0b1000 }

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

# formats time by the given amount
# create a format by bitwise ORing together Format enum values
static func GetFormattedTime(seconds : int, format : int) -> String:
	var formatted_time := "";
	if format & Format.DAYS:
		var days : int = seconds / SECONDS_IN_DAY;
		formatted_time += str(days) + "d ";
		seconds -= SECONDS_IN_DAY * days;
	if format & Format.HOURS:
		var hours : int = seconds / SECONDS_IN_HOUR;
		formatted_time += str(hours) + "h ";
		seconds -= SECONDS_IN_HOUR * hours;
	if format & Format.MINUTES:
		var minutes : int = seconds / SECONDS_IN_MINUTE;
		formatted_time += str(minutes) + "m ";
		seconds -= SECONDS_IN_MINUTE * minutes;
	if format & Format.SECONDS:
		formatted_time += str(seconds) + "s";
		seconds = 0;
	return formatted_time;
