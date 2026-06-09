<template>
	<div v-bind="$attrs" class="px-4 md:px-5 xl:px-25 ml-auto grid grid-cols-2 items-center">
		<div v-if="!appLayout" class="order-1 col-span-1 sm:hidden">
			<label role="button" tabindex="0">
				<SimpliersLogo class="text-white text-xl" />
				<input class="hidden" v-model="isMenuOpen" type="checkbox" />
			</label>
		</div>
		<div
			v-if="!appLayout"
			class="w-full overflow-hidden order-3 sm:order-2 col-span-2 sm:col-span-1 text-center sm:text-start h-auto"
		>
			<ul
				class="menu-horizontal py-1.5 px-1 mx-auto sm:ml-0 my-2 bg-white/10 rounded-lg hidden sm:flex w-min items-center"
				:class="{ 'flex!': isMenuOpen }"
			>
				<li>
					<a class="rounded-lg py-1 px-2 text-sm" :href="runtimeConfig.public.simpliersUrl" title="Simpliers">
						<SimpliersLogo colorClass="text-white" />
					</a>
					<!--          <a class="text-white rounded-lg py-1 px-2 text-sm" href="/" target="_blank">-->
					<!--            <simpliers-logo :class="activeNavItem === 'simpliers' ? '' : 'text-white'" class="" />-->
					<!--          </a>-->
				</li>
				<li>
					<a
						:href="
							$mergeDomainNPath(
								runtimeConfig.public.simpliersUrl,
								$t('components.baseComponents.mainHeader.giveawayPath'),
							)
						"
						class="rounded-lg py-1 px-2 text-sm"
						title="giveaway"
					>
						<GiveawayLogo :colorClass="activeNavItem === navItems.GIVEAWAY ? '' : 'text-white'" />
					</a>
				</li>
				<li>
					<LocalizedLink
						:class="{ 'bg-white': activeNavItem === navItems.CHAT }"
						class="rounded-lg py-1 px-2 text-sm"
						name="index"
					>
						<ChatLogo
							class="my-auto align-middle mb-px"
							:from="activeNavItem === navItems.CHAT ? undefined : '#FFFFFF'"
							:to="activeNavItem === navItems.CHAT ? undefined : '#FFFFFF'"
						/>
					</LocalizedLink>
				</li>
				<li>
					<LocalizedLink
						:class="{ 'bg-white': activeNavItem === navItems.BLOG }"
						class="rounded-lg py-1 px-2 text-sm"
						name="blog"
					>
						<BlogLogo :class="{ 'text-white!': !(activeNavItem === navItems.BLOG) }" />
					</LocalizedLink>
				</li>
			</ul>
		</div>
		<div
			class="order-2 sm:order-3 text-end"
			:class="{
				'col-span-2': appLayout,
				'min-h-10': !appLayout,
			}"
		>
			<!-- Login Button (when not logged in) -->
			<!--			<label-->
			<!--				v-if="!auth.loggedIn"-->
			<!--				for="auth-modal"-->
			<!--				class="btn bg-white/10 hover:bg-white border-none shadow-none text-white hover:text-base-content bg-white/10"-->
			<!--				@click="$emitter.emit('showAuthModal')"-->
			<!--			>-->
			<!--				{{ $t('components.baseComponents.mainHeader.loginButton') }}-->
			<!--			</label>-->
			<localized-link
				v-if="!auth.loggedIn"
				class="btn border-none shadow-none text-white hover:text-black hover:bg-white bg-white/10"
				name="index"
			>
				<i class="fa fa-user text-xs" />
				<span class="underline">{{ $t('components.baseComponents.mainHeader.myAccount') }}</span>
				<i class="fa fa-chevron-right text-xs link-icon" />
			</localized-link>

			<!-- User Dropdown (when logged in) -->
			<div v-else class="inline-block">
				<ClientOnly>
					<CustomDropdown class="z-100" @show="authMenuShow" placement="bottom-end">
						<button
							class="btn border-none shadow-none text-white"
							role="button"
							:class="{
								'btn-sm btn-ghost hover:bg-simpliers': appLayout,
								'hover:bg-white hover:text-black bg-white/10': !appLayout,
							}"
							tabindex="0"
						>
							<i class="fa fa-user text-xs" />
							<span>{{ $t('components.baseComponents.mainHeader.myAccount') }}</span>
							<i class="fa fa-chevron-right text-xs link-icon" />
						</button>

						<template #popper="{ show, hide }">
							<div class="menu bg-base-100 shadow-lg p-2 min-w-60">
								<div class="menu-title text-nowrap text-start font-semibold py-0">
									<div class="text-base-content truncate" :class="{ 'skeleton min-w-8 h-3': !auth.user?.name }">
										{{ auth.user?.name ?? '' }}
									</div>
									<div class="font-light text-sm flex items-center">
										<i class="fa fa-envelope mr-2" />
										<div class="truncate flex-1" :class="{ 'skeleton min-w-8 h-3': !auth.user?.email }">
											{{ auth.user?.email ?? ' ' }}
										</div>
									</div>
								</div>
								<div class="divider my-1"></div>
								<ul @click="hide()">
									<li>
										<localized-link class="py-2" name="index" rel="noopener noreferrer nofollow">
											<i class="fa fa-at mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.accounts') }}
										</localized-link>
									</li>
								</ul>
								<ul @click="hide()" class="overflow-y-auto max-h-50 ml-4">
									<li v-for="account in auth.user?.chatAccounts" :key="account.id">
										<LocalizedLink
											class="py-2 flex items-center"
											name="account"
											:query="{ username: account.post_account?.username }"
											rel="noopener noreferrer nofollow"
										>
											<span class="flex flex-1 items-center font-semibold">
												<img
													:src="account.post_account?.profile_picture || '/icon.svg'"
													:alt="account.post_account?.username"
													v-img-error
													class="w-4 h-4 rounded-full mr-4"
												/>
												{{ account.post_account?.username }}
											</span>
											<i class="fa fa-chevron-right text-xs link-icon" />
										</LocalizedLink>
									</li>
								</ul>
								<ul @click="hide()" class="bg-primary rounded-lg ml-4">
									<li class="">
										<a
											class="font-semibold text-base-100!"
											href="javascript:"
											@click="$emitter.emit('showAddAccountModal')"
										>
											<i class="fa fa-plus mr-2" />
											{{ $t('components.chat.sidebar.accountSelector.addAccountButton') }}
										</a>
									</li>
								</ul>
								<div class="divider my-1" />
								<ul @click="hide()">
									<li>
										<localized-link class="py-2" name="posts" rel="noopener noreferrer nofollow">
											<i class="fa fa-images mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.posts') }}
										</localized-link>
									</li>
									<li>
										<localized-link class="py-2" name="comments" rel="noopener noreferrer nofollow">
											<i class="fa fa-comments mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.comments') }}
										</localized-link>
									</li>
									<li>
										<localized-link class="py-2" name="contacts" rel="noopener noreferrer nofollow">
											<i class="fa fa-address-book mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.contacts') }}
										</localized-link>
									</li>
									<li>
										<localized-link class="py-2" name="chat" rel="noopener noreferrer nofollow">
											<i class="fa fa-message mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.chat') }}
										</localized-link>
									</li>
									<li>
										<localized-link class="py-2" name="flows" rel="noopener noreferrer nofollow">
											<i class="fa fa-paper-plane mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.flows') }}
										</localized-link>
									</li>
								</ul>
								<div class="divider my-1"></div>
								<ul @click="hide()">
									<li>
										<LocalizedLink name="affiliate" class="py-2 text-simpliers">
											<i class="fa fa-hashtag fa-md" />
											{{ $t('components.baseComponents.defaultLayoutHeader.navigation.partners') }}
										</LocalizedLink>
									</li>
								</ul>
								<div class="divider my-1"></div>
								<ul @click="hide()">
									<li>
										<a
											class="py-2"
											:href="
												$mergeDomainNPath(
													runtimeConfig.public.simpliersUrl,
													$t('components.baseComponents.mainHeader.dropdown.teamManagementPath'),
												)
											"
											target="_blank"
										>
											<i class="fa fa-users link-icon" />
											{{ $t('components.baseComponents.mainHeader.dropdown.teamManagement') }}
										</a>
									</li>
								</ul>
								<div class="divider my-1"></div>
								<ul @click="hide()">
									<li>
										<a
											class="py-2"
											:href="
												$mergeDomainNPath(
													runtimeConfig.public.simpliersUrl,
													$t('components.baseComponents.mainHeader.dropdown.giveawayPath'),
												)
											"
											target="_blank"
										>
											<span>
												<simpliers-logo />
												<giveaway-logo />
											</span>
											<i class="fa fa-external-link link-icon" />
										</a>
									</li>
									<li>
										<a
											class="py-2"
											:href="
												$mergeDomainNPath(
													runtimeConfig.public.formsUrl,
													$t('components.baseComponents.mainHeader.dropdown.formsPath'),
												)
											"
											target="_blank"
										>
											<span>
												<simpliers-logo />
												<forms-logo />
											</span>
											<i class="fa fa-external-link link-icon" />
										</a>
									</li>
								</ul>
								<div class="divider my-1"></div>
								<ul>
									<li>
										<a class="py-2" @click="logout">
											<i class="fa fa-sign-out-alt mr-2" />
											{{ $t('components.baseComponents.mainHeader.dropdown.logout') }}
										</a>
									</li>
								</ul>
							</div>
						</template>
					</CustomDropdown>
				</ClientOnly>
			</div>
		</div>
	</div>
</template>

<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import GiveawayLogo from '~/components/GlobalComponents/Brands/GiveawayLogo.vue'
import { useAuthStore } from '#imports'
import BlogLogo from '~/components/GlobalComponents/Brands/BlogLogo.vue'
import HUBLogo from '~/components/GlobalComponents/Brands/HUBLogo.vue'
import FormsLogo from '~/components/GlobalComponents/Brands/FormsLogo.vue'
import apiList from '~/apis/ApiList.js'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

const NAV_ITEMS = {
	CHAT: 'chat',
	BLOG: 'blog',
	GIVEAWAY: 'giveaway',
	SIMPLIERS: 'simpliers',
}

export default {
	components: {
		CustomDropdown,
		ChatLogo,
		FormsLogo,
		HUBLogo,
		BlogLogo,
		SimpliersLogo,
		LocalizedLink,
		GiveawayLogo,
	},

	setup() {
		return {
			auth: useAuthStore(),
			trackerStore: useTrackerStore(),
			runtimeConfig: useRuntimeConfig(),
			localeRoute: useLocaleRoute(),
		}
	},

	props: {
		appLayout: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		const { largerThan } = useWindowSize()

		return {
			largerThan,
			authenticated: null,
			isMenuOpen: false,
		}
	},

	mounted() {
		consoleLog('MainHeader mounted', this.auth.user)
		// if (import.meta.client && this.auth.loggedIn && this.auth.user) {
		// 	this.subscribeAccountAuthorized(this.auth.user)
		// 	this.subscribeAccountLoading(this.auth.user)
		// }

		this.applyMenuState()
	},

	watch: {
		'largerThan.sm'(v) {
			this.applyMenuState(v)
		},
	},
	computed: {
		navItems() {
			return NAV_ITEMS
		},
		activeNavItem() {
			const blogRoute = this.localeRoute({ name: 'blog' })

			if (blogRoute && this.$route.path.startsWith(blogRoute.path)) {
				return NAV_ITEMS.BLOG
			}

			return NAV_ITEMS.CHAT
		},
	},
	methods: {
		applyMenuState(isSmUp = this.largerThan.sm) {
			// >= 640 ise açık, < 640 ise kapalı
			this.isMenuOpen = isSmUp
		},
		async logout() {
			await this.auth.logout()

			const home = this.localeRoute({ name: 'index' })
			const finalUrl = window.location.origin + home.fullPath

			const ssoLogoutUrl =
				this.$mergeDomainNPath(this.runtimeConfig.public.simpliersUrl, 'sso/logout') +
				`?redirect=${encodeURIComponent(finalUrl)}`

			window.location.href = ssoLogoutUrl

			// this.$router.push({ name: 'index' })
		},
		authMenuShow() {
			if (this.trackerStore.token) return
			this.$requestAdapter.getToken(apiList.auth.user)
		},
	},
}
</script>
