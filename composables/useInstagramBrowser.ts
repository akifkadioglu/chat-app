export function useInstagramBrowser() {
	const isInstagramBrowser = () => {
		if (typeof window === 'undefined') return false

		const userAgent = window.navigator.userAgent || ''

		// Instagram in-app browser detection
		// Instagram app includes "Instagram" followed by version numbers in the user agent string
		// Example: Instagram 123.0.0.0.0 Android
		return /Instagram[^/]*\s+(?:\d+\.)*\d+/i.test(userAgent)
	}

	return {
		isInstagramBrowser,
	}
}
