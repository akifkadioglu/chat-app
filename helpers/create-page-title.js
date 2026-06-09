export default function (title) {
	let pageTitle = title + ' | Simpliers CHAT'

	if (process.env.NODE_ENV !== 'production') {
		pageTitle = `[${process.env.NODE_ENV.toUpperCase()}] ${pageTitle}`
	}
	return pageTitle
}
