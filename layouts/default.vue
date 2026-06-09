<template>
	<Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir" class="bg-simpliers">
		<Body class="simpliers-frame">
			<div id="simpliersFrame">
				<div v-if="nodeEnv === 'local' || (auth.loggedIn && auth.isAdmin)">
					<client-only>
						<LazyBaseComponentsAdminActions />
					</client-only>
				</div>

				<MainHeader id="main-header" />
				<section class="relative bg-base-100 rounded-lg">
					<div class="sticky top-0 z-10">
						<DefaultLayoutHeader />
					</div>
					<div class="flex-1">
						<slot />
					</div>
					<LazyBaseComponentsMainFooter hydrate-on-visible />
				</section>
			</div>
			<SupportLauncher />
			<AddAccountModal v-if="auth.loggedIn" />
			<AuthorizationSocketListener v-if="auth.loggedIn" />
			<LazyPricingActiveContactsInfoModal hydrate-on-idle />
			<!--			<AuthModalStore />-->
		</Body>
	</Html>
</template>

<script>
import DefaultLayoutHeader from '~/components/BaseComponents/DefaultLayoutHeader.vue'
import AddAccountModal from '~/components/BaseComponents/AddAccountModal.vue'
import AuthorizationSocketListener from '~/components/App/AuthorizationSocketListener.vue'

export default {
	components: {
		AddAccountModal,
		AuthorizationSocketListener,
		DefaultLayoutHeader,
		MainHeader: defineAsyncComponent(() => import('~/components/BaseComponents/Header/MainHeader.vue')),
		// AuthModalStore: defineAsyncComponent(() => import('~/components/GlobalComponents/Auth/AuthModalStore.vue')),
		SupportLauncher: defineAsyncComponent(() => import('~/components/Support/SupportLauncher.vue')),
	},
	setup() {
		const head = useLocaleHead()
		const settingsStore = useSettingsStore()

		usePageMeta({
			meta: [
				{
					name: 'server',
					content: settingsStore.serverName,
				},
			],
		})
		return {
			head,
			auth: useAuthStore(),
			router: useRouter(),
			localePath: useLocalePath(),
			localeRoute: useLocaleRoute(),
			settingsStore,
			sessionStore: useSessionStore(),
			colorMode: useColorMode(),
		}
	},
	data() {
		return {
			listeningMessages: false,
			nodeEnv: process.env.NODE_ENV,
		}
	},
	mounted() {
		// CSS dosyalarını asenkron yükleme
		if (import.meta.client) {
			// FontAwesome'ı asenkron yüklemek için
			setTimeout(() => {
				this.$domHelpers.loadExternalStyleSheet('/fonts/fontawesome710/css/all.min.css')
			}, 0)
		}
	},
}
</script>

<style scoped></style>
