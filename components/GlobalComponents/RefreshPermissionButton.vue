<template>
	<button
		@click="openTab"
		class="btn"
		:class="{ 'btn-disabled': !platformStore.instagramAuthUrl }"
		:disabled="!platformStore.instagramAuthUrl || loading || disabled || isLoading"
	>
		<LoadingElement v-if="showIcon" :is-loading="!platformStore.instagramAuthUrl || loading || isLoading" size="16">
			<slot name="icon">
				<i :class="iconClass || 'fa fa-refresh'" v-if="platformStore.instagramAuthUrl && showIcon" />
			</slot>
		</LoadingElement>
		<span v-if="showTitle" :class="titleClass">
			<slot>
				<i18n-t v-if="!title" keypath="components.globalComponents.refreshPermissionButton.title">
					<template #platformName>
						<span class="capitalize">{{ platform }}</span>
					</template>
				</i18n-t>
				<span v-else>{{ title }}</span>
			</slot>
		</span>
	</button>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { PLATFORMS } from '~/models/Social.ts'
import apiList from '~/apis/ApiList.js'

const PURPOSES = {
	PERMISSION: 'permission',
	LOGIN: 'login',
}
export default {
	components: { LoadingElement },
	props: {
		purpose: {
			type: String,
			default: PURPOSES.PERMISSION,
			validator: (value) => [PURPOSES.PERMISSION, PURPOSES.LOGIN].includes(value),
		},
		title: {
			type: String,
		},
		showTitle: {
			type: Boolean,
			default: true,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
		},
		showIcon: {
			type: Boolean,
			default: true,
		},
		titleClass: {
			type: String,
			default: 'text-sm md:text-md lg:text-lg',
		},
		iconClass: {
			type: String,
		},
		platform: {
			type: String,
			default: PLATFORMS.INSTAGRAM,
		},
		beforeOpenTabFunc: {
			type: Function,
			default: () => {},
		},
	},
	setup() {
		return {
			platformStore: usePlatformStore(),
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			isLoading: false,
		}
	},
	mounted() {
		this.platformStore.fetchAuthUrl(false)
	},
	methods: {
		trackEvent() {
			let event = 'chatRefreshInstagramPermissionClicked'
			if (this.purpose === PURPOSES.LOGIN) {
				event = 'chatLoginInstagramClicked'
			}
			this.$requestAdapter.post(apiList.tracker.logEventWeb, {
				event,
				args: {
					platform: this.platform,
				},
			})
		},
		async openTab() {
			this.isLoading = true
			this.trackEvent()
			this.beforeOpenTabFunc()
			this.isLoading = false

			if (this.platform === PLATFORMS.INSTAGRAM) {
				this.$gtag('event', 'loginWithInstagramClicked')
				this.$fbq('trackCustom', 'LoginWithInstagramClicked', {})
				this.platformStore.openInstagramTab()
				return
			}

			if (this.platform === PLATFORMS.FACEBOOK) {
				this.$gtag('event', 'loginWithFacebookClicked')
				this.$fbq('trackCustom', 'LoginWithFacebookClicked', {})
				this.platformStore.openFacebookTab()
				return
			}
		},
	},
}
</script>

<style scoped></style>
