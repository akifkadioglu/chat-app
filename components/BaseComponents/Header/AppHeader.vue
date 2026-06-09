<template>
	<div
		ref="header"
		class="border-b border-b-simpliers bg-base-100/20 backdrop-blur-3xl z-1"
		:class="{
			'rounded-t-lg': !showLogo,
		}"
	>
		<MegaHeader
			class="flex mx-auto items-center w-full px-4 py-1 md:px-5 xl:px-25"
			:ulClass="ulClass"
			:keepOpenOnClick="keepOpenOnClick"
		>
			<template #leading>
				<LocalizedLink :name="mainTarget" class="text-2xl">
					<slot name="logo">
						<SimpliersLogo class="inline" />
						<slot name="logoSuffix" />
					</slot>
				</LocalizedLink>
			</template>
			<slot />
			<template #trailing>
				<BaseComponentsThemeToggler class="my-auto" />
			</template>
		</MegaHeader>
	</div>
</template>

<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import MegaHeader from '~/components/BaseComponents/Header/MegaHeader.vue'

export default {
	components: {
		MegaHeader,
		LocalizedLink,
		SimpliersLogo,
	},
	props: {
		keepOpenOnClick: {
			type: Boolean,
			default: false,
		},
		ulClass: {
			type: String,
			default: 'w-full !md:place-content-center justify-around',
		},
	},
	data() {
		return {
			showLogo: false,
		}
	},
	setup() {
		return {
			routeBaseName: useRouteBaseName(),
		}
	},
	computed: {
		mainTarget() {
			return 'index'
		},
	},
	mounted() {
		window.addEventListener('scroll', this.handleScroll)
		this.handleScroll()
	},
	beforeUnmount() {
		window.removeEventListener('scroll', this.handleScroll)
	},
	methods: {
		handleScroll(e = null) {
			const header = this.$refs.header
			const mainHeader = document.getElementById('main-header')
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop
			if (header && mainHeader) {
				const mainHeaderHeight = mainHeader.offsetHeight
				const rect = header.getBoundingClientRect()
				this.showLogo = scrollTop >= mainHeaderHeight
			}
		},
	},
}
</script>
