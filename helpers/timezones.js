const TIMEZONES = [
	// UTC-12 to UTC-8
	{ identifier: 'Pacific/Honolulu', offset: -36000, offset_hours: -10, gmt: 'GMT-10:00', region: 'Pacific', city: 'Honolulu' },
	{ identifier: 'America/Anchorage', offset: -32400, offset_hours: -9, gmt: 'GMT-09:00', region: 'America', city: 'Anchorage' },
	{ identifier: 'America/Los_Angeles', offset: -28800, offset_hours: -8, gmt: 'GMT-08:00', region: 'America', city: 'Los Angeles' },

	// UTC-7 to UTC-5
	{ identifier: 'America/Denver', offset: -25200, offset_hours: -7, gmt: 'GMT-07:00', region: 'America', city: 'Denver' },
	{ identifier: 'America/Phoenix', offset: -25200, offset_hours: -7, gmt: 'GMT-07:00', region: 'America', city: 'Phoenix' },
	{ identifier: 'America/Mexico_City', offset: -21600, offset_hours: -6, gmt: 'GMT-06:00', region: 'America', city: 'Mexico City' },
	{ identifier: 'America/Chicago', offset: -21600, offset_hours: -6, gmt: 'GMT-06:00', region: 'America', city: 'Chicago' },
	{ identifier: 'America/New_York', offset: -18000, offset_hours: -5, gmt: 'GMT-05:00', region: 'America', city: 'New York' },
	{ identifier: 'America/Toronto', offset: -18000, offset_hours: -5, gmt: 'GMT-05:00', region: 'America', city: 'Toronto' },
	{ identifier: 'America/Bogota', offset: -18000, offset_hours: -5, gmt: 'GMT-05:00', region: 'America', city: 'Bogota' },
	{ identifier: 'America/Lima', offset: -18000, offset_hours: -5, gmt: 'GMT-05:00', region: 'America', city: 'Lima' },

	// UTC-4 to UTC-3
	{ identifier: 'America/Santiago', offset: -14400, offset_hours: -4, gmt: 'GMT-04:00', region: 'America', city: 'Santiago' },
	{ identifier: 'America/Caracas', offset: -14400, offset_hours: -4, gmt: 'GMT-04:00', region: 'America', city: 'Caracas' },
	{ identifier: 'America/Sao_Paulo', offset: -10800, offset_hours: -3, gmt: 'GMT-03:00', region: 'America', city: 'Sao Paulo' },
	{ identifier: 'America/Buenos_Aires', offset: -10800, offset_hours: -3, gmt: 'GMT-03:00', region: 'America', city: 'Buenos Aires' },

	// UTC+0 to UTC+1
	{ identifier: 'Atlantic/Reykjavik', offset: 0, offset_hours: 0, gmt: 'GMT+00:00', region: 'Atlantic', city: 'Reykjavik' },
	{ identifier: 'Europe/London', offset: 0, offset_hours: 0, gmt: 'GMT+00:00', region: 'Europe', city: 'London' },
	{ identifier: 'Europe/Lisbon', offset: 0, offset_hours: 0, gmt: 'GMT+00:00', region: 'Europe', city: 'Lisbon' },
	{ identifier: 'Africa/Casablanca', offset: 0, offset_hours: 0, gmt: 'GMT+00:00', region: 'Africa', city: 'Casablanca' },
	{ identifier: 'Europe/Paris', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Paris' },
	{ identifier: 'Europe/Berlin', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Berlin' },
	{ identifier: 'Europe/Madrid', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Madrid' },
	{ identifier: 'Europe/Rome', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Rome' },
	{ identifier: 'Europe/Amsterdam', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Amsterdam' },
	{ identifier: 'Europe/Brussels', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Brussels' },
	{ identifier: 'Europe/Vienna', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Europe', city: 'Vienna' },
	{ identifier: 'Africa/Lagos', offset: 3600, offset_hours: 1, gmt: 'GMT+01:00', region: 'Africa', city: 'Lagos' },

	// UTC+2 to UTC+3
	{ identifier: 'Europe/Athens', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Europe', city: 'Athens' },
	{ identifier: 'Europe/Bucharest', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Europe', city: 'Bucharest' },
	{ identifier: 'Europe/Helsinki', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Europe', city: 'Helsinki' },
	{ identifier: 'Europe/Kiev', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Europe', city: 'Kyiv' },
	{ identifier: 'Africa/Cairo', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Africa', city: 'Cairo' },
	{ identifier: 'Africa/Johannesburg', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Africa', city: 'Johannesburg' },
	{ identifier: 'Asia/Jerusalem', offset: 7200, offset_hours: 2, gmt: 'GMT+02:00', region: 'Asia', city: 'Jerusalem' },
	{ identifier: 'Europe/Istanbul', offset: 10800, offset_hours: 3, gmt: 'GMT+03:00', region: 'Europe', city: 'Istanbul' },
	{ identifier: 'Europe/Moscow', offset: 10800, offset_hours: 3, gmt: 'GMT+03:00', region: 'Europe', city: 'Moscow' },
	{ identifier: 'Asia/Riyadh', offset: 10800, offset_hours: 3, gmt: 'GMT+03:00', region: 'Asia', city: 'Riyadh' },
	{ identifier: 'Asia/Baghdad', offset: 10800, offset_hours: 3, gmt: 'GMT+03:00', region: 'Asia', city: 'Baghdad' },
	{ identifier: 'Africa/Nairobi', offset: 10800, offset_hours: 3, gmt: 'GMT+03:00', region: 'Africa', city: 'Nairobi' },

	// UTC+3:30 to UTC+5:30
	{ identifier: 'Asia/Tehran', offset: 12600, offset_hours: 3.5, gmt: 'GMT+03:30', region: 'Asia', city: 'Tehran' },
	{ identifier: 'Asia/Dubai', offset: 14400, offset_hours: 4, gmt: 'GMT+04:00', region: 'Asia', city: 'Dubai' },
	{ identifier: 'Asia/Baku', offset: 14400, offset_hours: 4, gmt: 'GMT+04:00', region: 'Asia', city: 'Baku' },
	{ identifier: 'Asia/Karachi', offset: 18000, offset_hours: 5, gmt: 'GMT+05:00', region: 'Asia', city: 'Karachi' },
	{ identifier: 'Asia/Tashkent', offset: 18000, offset_hours: 5, gmt: 'GMT+05:00', region: 'Asia', city: 'Tashkent' },
	{ identifier: 'Asia/Kolkata', offset: 19800, offset_hours: 5.5, gmt: 'GMT+05:30', region: 'Asia', city: 'Kolkata' },
	{ identifier: 'Asia/Colombo', offset: 19800, offset_hours: 5.5, gmt: 'GMT+05:30', region: 'Asia', city: 'Colombo' },

	// UTC+6 to UTC+8
	{ identifier: 'Asia/Dhaka', offset: 21600, offset_hours: 6, gmt: 'GMT+06:00', region: 'Asia', city: 'Dhaka' },
	{ identifier: 'Asia/Almaty', offset: 21600, offset_hours: 6, gmt: 'GMT+06:00', region: 'Asia', city: 'Almaty' },
	{ identifier: 'Asia/Bangkok', offset: 25200, offset_hours: 7, gmt: 'GMT+07:00', region: 'Asia', city: 'Bangkok' },
	{ identifier: 'Asia/Jakarta', offset: 25200, offset_hours: 7, gmt: 'GMT+07:00', region: 'Asia', city: 'Jakarta' },
	{ identifier: 'Asia/Ho_Chi_Minh', offset: 25200, offset_hours: 7, gmt: 'GMT+07:00', region: 'Asia', city: 'Ho Chi Minh' },
	{ identifier: 'Asia/Singapore', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Asia', city: 'Singapore' },
	{ identifier: 'Asia/Hong_Kong', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Asia', city: 'Hong Kong' },
	{ identifier: 'Asia/Shanghai', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Asia', city: 'Shanghai' },
	{ identifier: 'Asia/Taipei', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Asia', city: 'Taipei' },
	{ identifier: 'Asia/Manila', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Asia', city: 'Manila' },
	{ identifier: 'Australia/Perth', offset: 28800, offset_hours: 8, gmt: 'GMT+08:00', region: 'Australia', city: 'Perth' },

	// UTC+9 to UTC+12
	{ identifier: 'Asia/Tokyo', offset: 32400, offset_hours: 9, gmt: 'GMT+09:00', region: 'Asia', city: 'Tokyo' },
	{ identifier: 'Asia/Seoul', offset: 32400, offset_hours: 9, gmt: 'GMT+09:00', region: 'Asia', city: 'Seoul' },
	{ identifier: 'Australia/Sydney', offset: 36000, offset_hours: 10, gmt: 'GMT+10:00', region: 'Australia', city: 'Sydney' },
	{ identifier: 'Australia/Melbourne', offset: 36000, offset_hours: 10, gmt: 'GMT+10:00', region: 'Australia', city: 'Melbourne' },
	{ identifier: 'Australia/Brisbane', offset: 36000, offset_hours: 10, gmt: 'GMT+10:00', region: 'Australia', city: 'Brisbane' },
	{ identifier: 'Pacific/Auckland', offset: 43200, offset_hours: 12, gmt: 'GMT+12:00', region: 'Pacific', city: 'Auckland' },
]

export function getTimezones() {
	return TIMEZONES
}

export function getTimezoneByIdentifier(identifier) {
	return TIMEZONES.find((tz) => tz.identifier === identifier)
}

export function getTimezonesByRegion(region) {
	return TIMEZONES.filter((tz) => tz.region === region)
}

export function getTimezoneByOffset(offsetHours) {
	return TIMEZONES.filter((tz) => tz.offset_hours === offsetHours)
}

export function formatTimezoneLabel(tz) {
	return `${tz.city} (${tz.gmt})`
}

export default TIMEZONES
