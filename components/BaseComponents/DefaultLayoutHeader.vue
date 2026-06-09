<template>
	<AppHeader keepOpenOnClick class="sticky top-0" ul-class="w-full md:justify-end md:gap-4 justify-around">
		<template #logoSuffix>
			<ChatLogo />
		</template>
		<LazyBaseComponentsHeaderSolutionsMegaMenu hydrate-on-interaction />
		<LazyBaseComponentsHeaderUseCasesMegaMenu hydrate-on-interaction />
		<LazyBaseComponentsHeaderAffiliateMegaMenu hydrate-on-interaction />

		<li>
			<MenuLink name="pricing">
				<i class="fa fa-tag fa-md" />
				{{ $t('components.baseComponents.defaultLayoutHeader.navigation.pricing') }}
			</MenuLink>
		</li>

		<li>
			<MenuLink name="support">
				<i class="fa fa-life-ring fa-md" />
				{{ $t('components.baseComponents.defaultLayoutHeader.navigation.support') }}
			</MenuLink>
		</li>
	</AppHeader>
</template>

<script>
import MenuLink from '~/components/BaseComponents/Header/MenuLink.vue'
import AppHeader from '~/components/BaseComponents/Header/AppHeader.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	components: {
		ChatLogo,
		MenuLink,
		AppHeader,
	},
	data: () => ({
		showLogo: false,
	}),
	mounted() {
		window.addEventListener('scroll', this.onScroll)
	},
	beforeUnmount() {
		window.removeEventListener('scroll', this.onScroll)
	},
	methods: {
		onScroll(e) {
			this.showLogo = e.target.documentElement?.scrollTop ?? 0 >= 60
		},
	},
}
</script>
