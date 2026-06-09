// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { NodeTypes } from '@vue/compiler-core'

console.log('process.env.NODE_ENV', process.env.ENV)

export default defineNuxtConfig({
    devServer: {
        port: 3003,
    },
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    app: {
        // pageTransition: { name: 'fade', mode: 'out-in' },
        head: {
            link: [
                { rel: 'icon', type: 'image/png', href: '/favicon.ico?v=2' },
                { rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/apple-touch-icon.png' },
                // Above-the-fold icin en sik kullanilan font weight'lerini preload et (swap gecikmesi + CLS azaltir)
                {
                    rel: 'preload',
                    as: 'font',
                    type: 'font/woff2',
                    href: '/fonts/PoppinsWoff/Poppins-Regular.woff2',
                    crossorigin: '',
                },
                {
                    rel: 'preload',
                    as: 'font',
                    type: 'font/woff2',
                    href: '/fonts/PoppinsWoff/Poppins-SemiBold.woff2',
                    crossorigin: '',
                },
                {
                    rel: 'preload',
                    as: 'font',
                    type: 'font/woff2',
                    href: '/fonts/PoppinsWoff/Poppins-Bold.woff2',
                    crossorigin: '',
                },
            ],
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                // { 'http-equiv': 'Content-Security-Policy', content: 'upgrade-insecure-requests' },
            ],
        },
    },
    vue: {
        compilerOptions: {
            whitespace: 'preserve',
            nodeTransforms: [
                (node) => {
                    if (node.type === NodeTypes.ELEMENT && node.tag === 'i18n-t') {
                        node.children = node.children.filter(
                            (child) => !(child.type === NodeTypes.TEXT && /^\s*$/.test(child.content)),
                        )
                    }
                },
            ],
        },
    },
    vite: {
        envPrefix: ['VITE_', 'SHORTEN_URL', 'CLOUD_URL', 'CLOUD_CO_URL', 'AUTH_TOKEN_COOKIE_KEY', 'NODE_ENV'],
        $server: {
            build: {
                rollupOptions: {
                    output: {
                        preserveModules: true,
                    },
                },
            },
        },
        plugins: [tailwindcss()],
        server: {
            allowedHosts: [
                'simpliers.com',
                'simpliers.co',
                'dev.simpliers.com',
                'simpliers.local',
                'api.simpliers.com',
                'chat.simpliers.com',
                'chat-dev.simpliers.com',
            ],
        },
        optimizeDeps: {
            include: [
                'pusher-js',
                'gsap',
                'gsap/Flip',
                'vue3-lottie',
                'dayjs',
                'dayjs/locale/tr',
                'dayjs/locale/en',
                'aos',
                'emoji-regex',
                'vue-easy-lightbox',
                'lodash',
                'lodash/debounce',
                '@capacitor/clipboard',
                'traverse',
                'embla-carousel',
                'embla-carousel-autoplay',
                'embla-carousel-vue',
                'uuid',
                'vue-virtual-scroller',
                '@dagrejs/dagre',
                '@dagrejs/graphlib',
                'apexcharts',
                'vue3-apexcharts',
                'sortablejs',
                'sweetalert2',
                'mitt',
                'lodash/debounce.js',
                'dayjs/plugin/relativeTime',
                'v3-infinite-loading',
            ],
        },
    },
    build: {
        transpile: ['simpliers-nuxt-utils', 'vue-3-mask'],
        // extractCSS: true, // CSS dosyalarını JS'den ayırır
        // optimization: {
        //   splitChunks: {
        //     chunks: 'all',
        //     automaticNameDelimiter: '.',
        //     name: undefined
        //   }
        // }
    },
    i18n: {
        baseUrl: process.env.VITE_BASE_URL,
        defaultLocale: 'en',
        strategy: 'prefix',
        lazy: true,
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
            alwaysRedirect: false,
            fallbackLocale: 'en',
        },
        bundle: { optimizeTranslationDirective: false },
        langDir: 'locales',
        locales: [
            // {code: 'de', language: 'de', name: 'Deutsch', file: 'de.json'},
            // {code: 'el', language: 'el', name: 'Ελληνικα', file: 'el.json'},
            { code: 'en', language: 'en', name: 'English', file: 'en.json', isCatchallLocale: true },
            // { code: 'es', language: 'es', name: 'Español', file: 'es.json' },
            // { code: 'fr', language: 'fr', name: 'Français', file: 'fr.json' },
            // {code: 'id', language: 'id', name: 'Bahasa Indonesia', file: 'id.json'},
            // {code: 'it', language: 'it', name: 'Italiano', file: 'it.json'},
            // { code: 'pt', language: 'pt', name: 'Português', file: 'pt.json' },
            // {code: 'ru', language: 'ru', name: 'Русский', file: 'ru.json'},
            // {code: 'ro', language: 'ro', name: 'Român', file: 'ro.json'},
            { code: 'tr', language: 'tr', name: 'Türkçe', file: 'tr.json' },
        ],
    },
    router: {
        options: {
            linkActiveClass: 'active-soft',
            linkExactActiveClass: 'active',
        },
    },
    echo: {
        key: process.env.VUE_APP_PUSHER_APP_KEY, // Your Laravel Echo app key
        broadcaster: 'reverb',
        host: process.env.SOCKET_HOST,
        port: parseInt(process.env.SOCKET_PORT ?? ''),
        scheme: process.env.ENV === 'local' ? 'http' : 'https', // available: http, https
        transports: ['ws', 'wss'],
    },
    runtimeConfig: {
        nodeEnv: process.env.ENV,
        baseURL: process.env.VITE_BASE_URL,
        public: {
            baseURL: process.env.VITE_BASE_URL,
            baseUrl: process.env.VITE_BASE_URL,
            apiBaseUrl: process.env.API_BASE_URL,
            cloudUrl: process.env.CLOUD_URL,
            shortenUrl: process.env.SHORTEN_URL,
            createUrl: process.env.CREATE_URL,
            simpliersUrl: process.env.SIMPLIERS_URL,
            formsUrl: process.env.FORMS_URL,
            hubUrl: process.env.HUB_URL,
            authBaseUrl: process.env.AUTH_BASE_URL,

            googleClientId: process.env.GOOGLE_CLIENT_ID,
            clarityId: process.env.CLARITY_ID,
            googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
            googleAdsId: process.env.GOOGLE_ADS_ID,

            instagramClientId: process.env.INSTAGRAM_CLIENT_ID,
            instagramRedirectUri: process.env.INSTAGRAM_REDIRECT_URI,
            instagramScope: process.env.INSTAGRAM_SCOPE,
            instagramResponseType: process.env.INSTAGRAM_RESPONSE_TYPE,
            instagramForceReauth: process.env.INSTAGRAM_FORCE_REAUTH,

            SERVER_NAME: process.env.NUXT_PUBLIC_SERVER_NAME || 'defaultServerName',
        },
    },
    plugins: [{ src: '~/plugins/04.serverInit.server.js', order: 4, mode: 'server' }],
    modules: [
        'simpliers-nuxt-utils',
        '@nuxt/fonts',
        '@nuxt/icon',
        '@nuxt/image',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxt/content',
        '@nuxtjs/sitemap',
        '@nuxtjs/i18n',
        'nuxt-laravel-echo',
        '@formkit/auto-animate/nuxt',
        '@nuxtjs/color-mode',
        'floating-vue/nuxt',
        'nuxt-svgo',
        'nuxt-jsonld',
    ],
    colorMode: {
        dataValue: 'theme',
        storage: 'cookie',
        storageKey: 'theme',
        fallback: 'smpl-chat',
        preference: 'system',
    },
    css: [
        '~/assets/css/main.css',
        '~/assets/css/animate-subset.css',
        '~/assets/css/custom.css',
        '~/assets/css/transitions.css',
    ],
    sitemap: {
        sources: ['/api/__sitemap__/blog'],
        // @ts-expect-error source name is valid at runtime but missing from the narrow AppSourceContext union
        excludeAppSources: ['@nuxt/content@v3:urls'],
    },
    simpliersNuxtUtils: {
        enablePlugins: true,
    },
    image: {
        quality: 70,
        format: ['webp'],
    },
    content: {
        renderer: {
            anchorLinks: false,
        },
    },
    routeRules: {
        // Statik asset'ler icin uzun cache (cache-lifetime savings) - font path'leri degismiyor
        '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
        '/images/**': { headers: { 'cache-control': 'public, max-age=2592000' } },

        '/app/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/partner/app/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/partner/form': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/partner/programs/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/isbirligi/app/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/isbirligi/basvuru': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/isbirligi/programlar/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/pre/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/preview/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/admin/**': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/sso': {
            robots: false,
            sitemap: false,
            index: false,
        },
        '/index2': {
            robots: false,
            sitemap: false,
            index: false,
        },
    },
    nitro: {
        // Prerendered HTML + /_nuxt asset'leri build-time'da .br/.gz olarak on-sıkıştırır
        compressPublicAssets: { gzip: true, brotli: true },
    },
    features: {
        inlineStyles: true,
    },
    experimental: {
        // inlineRouteRules: true,
    },
})
