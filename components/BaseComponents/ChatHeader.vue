<template>
	<AppHeader keepOpenOnClick class="!bg-base-100" ulClass="w-full !md:place-content-center justify-end gap-3">
		<template #logoSuffix>
			<ChatLogo />
		</template>
		<li>
			<MenuLink name="account" :class="{ active: $route.name.includes('account') }" class="md:!py-1 text-sm!">
				<i class="fa-solid fa-at text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.accounts') }}
			</MenuLink>
		</li>
		<li>
			<MenuLink
				:to="
					$mergeDomainNPath(
						runtimeConfig.public.simpliersUrl,
						$t('components.baseComponents.appHeader.navigation.giveaway'),
					)
				"
				class="md:!py-1 text-sm! hover:!text-simpliers"
			>
				<GiveawayLogo colorClass="hover:!text-simpliers" />
				<i class="fa fa-external-link link-icon align-baseline" />
			</MenuLink>
		</li>
		<li>
			<MenuLink name="posts" :class="{ active: $route.name.includes('posts') }" class="md:!py-1 text-sm!">
				<i class="fa-solid fa-images text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.posts') }}
			</MenuLink>
		</li>
		<li>
			<MenuLink name="comments" :class="{ active: $route.name.includes('comments') }" class="md:!py-1 text-sm!">
				<i class="fa fa-comments text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.comments') }}
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="contacts"
				:class="{
					active: $route.name.includes('contacts'),
				}"
				class="md:!py-1 text-sm!"
			>
				<i class="fa fa-address-book text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.contacts') }}
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="chat"
				:class="{
					active: $route.name.includes('chat'),
				}"
				class="md:!py-1 text-sm!"
			>
				<i class="fa fa-message text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.chat') }}
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="flows"
				:class="{
					active: $route.name.includes('flows'),
				}"
				class="md:!py-1 text-sm!"
			>
				<i class="fa fa-paper-plane text-xs" />
				{{ $t('components.baseComponents.appHeader.navigation.flows') }}
			</MenuLink>
		</li>
		<template #trailing>
			<base-components-theme-toggler />
		</template>
	</AppHeader>
</template>

<script>
import MenuLink from '~/components/BaseComponents/Header/MenuLink.vue'
import GiveawayLogo from '@/components/GlobalComponents/Brands/GiveawayLogo'
import AppHeader from '~/components/BaseComponents/Header/AppHeader.vue'
import MegaMenu from '~/components/BaseComponents/Header/MegaMenu.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import AnimatedSimpliersChat from '~/components/GlobalComponents/Brands/AnimatedSimpliersChat.vue'

export default {
	components: {
		AnimatedSimpliersChat,
		ChatLogo,
		LocalizedLink,
		MegaMenu,
		MenuLink,
		AppHeader,
		GiveawayLogo,
	},
	computed: {
		mainTarget() {
			return 'index'
		},
	},
	setup() {
		return {
			runtimeConfig: useRuntimeConfig(),
		}
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
