export default function (src, id = undefined) {
	if (!window || !document) {
		return
	}
	if (!id) {
		id = src.replace(/[^a-zA-Z0-9]/g, '')
	}

	let script = document.getElementById(id)
	return new Promise((resolve, reject) => {
		if (script) {
			return resolve()
		}

		script = document.createElement('script')
		script.type = 'text/javascript'
		script.id = id
		script.src = src
		script.onload = function () {
			resolve()
		}
		script.onerror = function () {
			reject(new Error('Failed to load script ' + src))
		}
		document.body.appendChild(script)
	})
}

export function loadExternalStyleSheet(src, id = null, pend = 'append') {
	if (!window || !document) {
		return
	}
	if (!id) {
		id = src.replace(/[^a-zA-Z0-9]/g, '')
	}

	let link = document.getElementById(id)
	return new Promise((resolve, reject) => {
		if (link) {
			return resolve()
		}

		link = document.createElement('link')
		link.type = 'text/css'
		link.id = id
		link.rel = 'stylesheet'
		link.href = src
		link.onload = function () {
			resolve()
		}
		link.onerror = function () {
			reject(new Error('Failed to load stylesheet ' + src))
		}

		if (pend === 'prepend') {
			document.head.prepend(link)
		} else {
			document.head.appendChild(link)
		}
	})
}
