export default defineNuxtPlugin((nuxtApp) => {
	if (typeof window === 'undefined') return

	// fbq stub kurulur (network yok) - erken $fbq cagrilari queue'lanir, script gelince flush olur
	!(function (f, n) {
		if (f.fbq) return
		n = f.fbq = function () {
			n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
		}
		if (!f._fbq) f._fbq = n
		n.push = n
		n.loaded = !0
		n.version = '2.0'
		n.queue = []
	})(window)

	let loaded = false
	const loadPixel = () => {
		if (loaded) return
		loaded = true

		const script = document.createElement('script')
		script.async = true
		script.src = 'https://connect.facebook.net/en_US/fbevents.js'
		const first = document.getElementsByTagName('script')[0]
		first.parentNode.insertBefore(script, first)

		window.fbq('init', '1528852628460631')
		window.fbq('track', 'PageView')
	}

	// Ilk paint'i bloke etmemek icin idle veya ilk etkilesime kadar ertele
	const IDLE_TIMEOUT = 4000
	const events = ['scroll', 'pointerdown', 'keydown', 'touchstart']
	const trigger = () => {
		events.forEach((evt) => window.removeEventListener(evt, trigger))
		document.removeEventListener('visibilitychange', onHidden)
		loadPixel()
	}
	events.forEach((evt) => window.addEventListener(evt, trigger, { once: true, passive: true }))

	// Erken bounce: kullanici etkilesim olmadan sekmeyi kapatirsa/cikarsa pixel'i yine de yukle
	const onHidden = () => {
		if (document.visibilityState === 'hidden') trigger()
	}
	document.addEventListener('visibilitychange', onHidden)

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(loadPixel, { timeout: IDLE_TIMEOUT })
	} else {
		setTimeout(loadPixel, IDLE_TIMEOUT)
	}

	// Pixel yuklendikten sonra route degisiminde PageView at
	nuxtApp.hook('page:finish', () => {
		if (loaded && window.fbq) window.fbq('track', 'PageView')
	})

	// $fbq helper - Standard ve Custom eventler için
	nuxtApp.provide('fbq', (type, eventName, params = {}) => {
		if (typeof window === 'undefined' || !window.fbq) return
		if (type === 'track') {
			window.fbq('track', eventName, params)
		} else if (type === 'trackCustom') {
			window.fbq('trackCustom', eventName, params)
		}
	})
})
