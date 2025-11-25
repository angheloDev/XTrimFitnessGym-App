/**
 * Utility functions for time formatting
 */

/**
 * Formats a time string or hour number to 12-hour format (AM/PM)
 * @param time - Can be:
 *   - A string in format "HH" or "HH-MM" (24-hour format)
 *   - A number representing hours (0-23)
 *   - A string already in 12-hour format (will be returned as-is if it contains AM/PM)
 * @returns Formatted time string in 12-hour format (e.g., "8:00 AM", "2:30 PM")
 */
export const formatTimeTo12Hour = (time: string | number | null | undefined): string => {
	if (!time && time !== 0) return 'Not set';

	// If it's already in 12-hour format (contains AM/PM), return as-is
	if (typeof time === 'string' && (time.includes('AM') || time.includes('PM'))) {
		return time;
	}

	let hour: number;
	let minutes = 0;

	if (typeof time === 'number') {
		hour = time;
	} else if (typeof time === 'string') {
		// Handle "HH-MM" format (e.g., "8-18")
		if (time.includes('-') && !time.includes(' ')) {
			const [start] = time.split('-');
			hour = parseInt(start, 10);
		} else if (time.includes(':')) {
			// Handle "HH:MM" format
			const [h, m] = time.split(':');
			hour = parseInt(h, 10);
			minutes = parseInt(m || '0', 10);
		} else {
			// Handle "HH" format
			hour = parseInt(time, 10);
		}
	} else {
		return 'Not set';
	}

	if (isNaN(hour)) return 'Not set';

	const period = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour % 12 || 12;
	const displayMinutes = minutes.toString().padStart(2, '0');

	return minutes > 0
		? `${displayHour}:${displayMinutes} ${period}`
		: `${displayHour}:00 ${period}`;
};

/**
 * Formats a time range string (e.g., "8-18") to 12-hour format range
 * @param timeRange - Time range string in format "HH-HH" (24-hour format)
 * @returns Formatted time range string (e.g., "8:00 AM - 6:00 PM")
 */
export const formatTimeRangeTo12Hour = (
	timeRange: string | null | undefined
): string => {
	if (!timeRange) return 'Not set';

	// If already in 12-hour format, return as-is
	if (timeRange.includes('AM') || timeRange.includes('PM')) {
		return timeRange;
	}

	// Handle "HH-HH" format
	if (timeRange.includes('-') && !timeRange.includes(' ')) {
		const [start, end] = timeRange.split('-');
		const startFormatted = formatTimeTo12Hour(parseInt(start, 10));
		const endFormatted = formatTimeTo12Hour(parseInt(end, 10));
		return `${startFormatted} - ${endFormatted}`;
	}

	// If it's a single time, format it
	return formatTimeTo12Hour(timeRange);
};

