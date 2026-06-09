import createPageTitle from '~/helpers/create-page-title'

type MetaOptions = {
	titlePath: string | null
	title: string | null
	descPath: string | null
	desc: string | null
	sitenamePath: string | null
	meta: Array<{ property: string; content: string }> | null
	iosApp: string | null
	iosDeeplink: string | null
	fbAppId: string | null
}

type MetaOptionsParam = MetaOptions | (() => MetaOptions)

export function usePageMeta(metaOptions: MetaOptionsParam) {
	const { t } = useI18n()
	const i18nHead = useLocaleHead({ seo: { canonicalQueries: ['foo'] } })
	const nuxtApp = useNuxtApp()
	const runtimeConfig = useRuntimeConfig()
	const defaultOgImage = nuxtApp.$mergeDomainNPath(runtimeConfig.public.baseUrl, '/images/simpliers-chat-image.jpg')

	// Eğer metaOptions bir fonksiyon ise, reactive bir yapı olarak kullan
	if (typeof metaOptions === 'function') {
		useHead(() => {
			const options = metaOptions()
			const titlePath = options.titlePath || 'headers.index.title'
			const title = options.title || null
			const descPath = options.descPath || 'headers.index.description'
			const desc = options.desc || null
			const sitenamePath = options.sitenamePath || 'headers.index.sitename'
			const meta = options.meta || []
			const iosApp = options.iosApp || 'app-id=6451319166'
			const iosDeeplink = options.iosDeeplink || 'simpliersgiveaway://giveaway-home'
			const fbAppId = options.fbAppId || '836957748798429'

			return createMetaData({
				titlePath,
				title,
				descPath,
				desc,
				sitenamePath,
				meta,
				iosApp,
				iosDeeplink,
				fbAppId,
				defaultOgImage,
				t,
				i18nHead,
			})
		})
	} else {
		// non-reactive
		const options = metaOptions
		const titlePath = options.titlePath || 'headers.index.title'
		const title = options.title || null
		const descPath = options.descPath || 'headers.index.description'
		const desc = options.desc || null
		const sitenamePath = options.sitenamePath || 'headers.index.sitename'
		const meta = options.meta || []
		const iosApp = options.iosApp || 'app-id=6451319166'
		const iosDeeplink = options.iosDeeplink || 'simpliersgiveaway://giveaway-home'
		const fbAppId = options.fbAppId || '836957748798429'

		useHead(() =>
			createMetaData({
				titlePath,
				title,
				descPath,
				desc,
				sitenamePath,
				meta,
				iosApp,
				iosDeeplink,
				fbAppId,
				defaultOgImage,
				t,
				i18nHead,
			}),
		)
	}
}

function createMetaData(options: {
	titlePath: string
	title: string | null
	descPath: string
	desc: string | null
	sitenamePath: string
	meta: Array<Record<string, any>>
	iosApp: string
	iosDeeplink: string
	fbAppId: string | null
	defaultOgImage: string
	t: Function
	i18nHead: any
}) {
	const {
		titlePath,
		title,
		descPath,
		desc,
		sitenamePath,
		meta,
		iosApp,
		iosDeeplink,
		fbAppId,
		defaultOgImage,
		t,
		i18nHead,
	} = options

	const resolvedTitle = createPageTitle(title ?? t(titlePath))
	const resolvedDesc = desc ?? t(descPath)

	const defaultMetas = [
		{ name: 'title', content: resolvedTitle },
		{ name: 'description', content: resolvedDesc },
		{ property: 'og:title', content: resolvedTitle },
		{ property: 'og:description', content: resolvedDesc },
		{ property: 'og:site_name', content: t(sitenamePath) },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:image', content: defaultOgImage },
		{ property: 'og:image:secure_url', content: defaultOgImage },
		{ property: 'og:image:type', content: 'image/jpeg' },
		{ property: 'og:image:width', content: '1205' },
		{ property: 'og:image:height', content: '635' },
		{ property: 'og:image:alt', content: resolvedTitle },
		{ property: 'fb:app_id', content: fbAppId || '' },
		{ name: 'site_name', content: t(sitenamePath) },
		{ name: 'apple-itunes-app', content: iosApp + ', app-argument=' + iosDeeplink },
		{ name: 'theme-color', content: '#e0003b' },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: resolvedTitle },
		{ name: 'twitter:description', content: resolvedDesc },
		{ name: 'twitter:image', content: defaultOgImage },
		{ name: 'twitter:image:alt', content: resolvedTitle },
	].filter(
		(dm) =>
			meta.findIndex((m) => {
				if (m.name) {
					return m.name === dm.name
				}
				return m.property === dm.property
			}) === -1,
	)

	return {
		title: resolvedTitle,
		meta: [...defaultMetas, ...(meta || []), ...(i18nHead.value.meta || [])],
		link: [...(i18nHead.value.link || [])],
	}
}

// export function usePageMeta({
//                                 titlePath = 'headers.index.title',
//                                 title = null,
//                                 descPath = 'headers.index.description',
//                                 desc = null,
//                                 sitenamePath = 'headers.giveaway.instagram.sitename',
//                                 meta = [],
//                                 iosApp = 'app-id=6451319166',
//                                 iosDeeplink = 'simpliersgiveaway://giveaway-home',
//                             }) {
//     const {t} = useI18n()
//     const i18nHead = useLocaleHead({seo: {canonicalQueries: ['foo']}})
//
//     console.log('title', title, t(titlePath))
//     useHead(()=>({
//         title: createPageTitle(title ?? t(titlePath)),
//         // titleTemplate: (titleChunk) => createPageTitle(title ?? t(titlePath)),
//         meta: [
//             {property: 'title', content: createPageTitle(title ?? t(titlePath))},
//             {property: 'description', content: desc ?? t(descPath)},
//             {property: 'og:title', content: createPageTitle(title ?? t(descPath))},
//             {property: 'og:description', content: desc ?? t(descPath)},
//             {property: 'og:site_name', content: t(sitenamePath)},
//             {
//                 property: 'apple-itunes-app',
//                 content: iosApp + ', app-argument=' + iosDeeplink
//             },
//             ...(meta || []),
//             ...(i18nHead.value.meta || [])
//         ]
//     }))
// }
