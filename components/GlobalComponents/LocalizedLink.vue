<template>
	<NuxtLink exact-active-class="" active-class="" :to="getTo" :target="targetData" :title="title">
		<slot />
	</NuxtLink>
</template>
<script>
export default {
	props: {
		name: {
			type: String,
			default: '',
		},
		title: {
			type: String,
			default: '',
		},
		to: {
			type: [String, Object],
			default: null,
		},
		params: {
			type: Object,
			default: () => ({}),
		},
		query: {
			type: Object,
			default: () => ({}),
		},
		target: {
			type: String,
			default: '',
		},
		hash: {
			type: String,
			default: '',
		},
	},
	setup() {
		const sessionStore = useSessionStore()
		const getRouteBaseName = useRouteBaseName()
		return {
			sessionStore,
			getRouteBaseName,
			localePath: useLocalePath(),
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			targetData: this.target,
		}
	},
	computed: {
		getTo() {
			const to = this.to
			const username = this.$route.query.username
			const query = { ...this.query }
			query.username = query.username ?? username

			if (to && typeof to === 'object') {
				return this.localePath({
					...to,
					query: {
						...to.query,
						...query,
					},
					hash: this.hash,
				})
			}

			// to string olarak geldiyse (örn: switchLocalePath'den) doğrudan kullan
			if (to && typeof to === 'string') {
				return to
			}

			return this.localePath({
				name: this.name,
				params: this.params,
				query,
				hash: this.hash,
			})
		},
	},
	mounted() {
		const isMobile = this.sessionStore.isMobile
		let isAdmin = this.authStore?.isAdmin

		if (!this.getTo) {
			if (import.meta.dev || isAdmin) {
				this.$toast.error(
					this.$t('components.globalComponents.localizedLink.routeNotFound', { route: this.name || this.to }),
				)
			}
		}

		if (isMobile && this.target === '_blank') {
			this.targetData = null
		}
	},
}
</script>
