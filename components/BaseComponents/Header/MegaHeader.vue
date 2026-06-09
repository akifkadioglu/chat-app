<template>
	<div ref="navbarRef" class="flex flex-wrap py-1" :class="[shadowNone]" @click.stop="onClickInside">
		<!--		ref="menuRef"-->
		<div class="order-1 ml-0 flex justify-between flex-auto" :class="flexNone">
			<slot name="leading" />
		</div>

		<div class="order-2 ml-auto flex gap-2">
			<div class="flex lg:hidden">
				<slot name="trailing" />
			</div>
			<div class="flex items-center gap-2">
				<div class="gap-1" :class="hideOnLargeScreen" v-show="$slots.default">
					<label class="swap swap-rotate fa-lg" @click.stop>
						<input v-model="isMenuOpen" type="checkbox" class="hidden" />
						<i class="swap-on fa fa-xmark" />
						<i class="swap-off fa fa-bars" />
					</label>
				</div>
			</div>
		</div>

		<div
			:class="[orderLast, justifyEnd, smallScreenContainer, largeScreenContainer, { [mobileMenuHidden]: !isMenuOpen }]"
		>
			<div class="w-full">
				<div class="w-full flex items-center px-5">
					<ul class="w-full p-0 min-w-full" :class="[desktopLayoutClassOnUl, menuDirectionOnUl, ulClass]">
						<slot />
						<li class="hidden lg:flex"><slot name="trailing" /></li>
					</ul>
				</div>
			</div>
		</div>
		<!--		<div class="order-3 space-x-2 flex items-center w-max ml-auto" :class="{ 'navbar-end': isSmallScreen }">-->
		<!--			-->
		<!--		</div>-->
	</div>
</template>

<script>
export default {
	props: {
		keepOpenOnClick: {
			type: Boolean,
			default: false,
		},
		collapseAt: {
			type: String,
			default: 'md',
		},
		ulClass: {
			type: String,
			default: '',
		},
	},
	data() {
		const shadowNone = {
			sm: 'sm:shadow-none',
			md: 'md:shadow-none',
			lg: 'lg:shadow-none',
			xl: 'xl:shadow-none',
			'2xl': '2xl:shadow-none',
		}
		const orderLast = {
			sm: 'order-last sm:order-2',
			md: 'order-last md:order-2',
			lg: 'order-last lg:order-2',
			xl: 'order-last xl:order-2',
			'2xl': 'order-last 2xl:order-2 ',
		}
		const desktopLayoutClassOnUl = {
			sm: 'sm:flex',
			md: 'md:flex',
			lg: 'lg:flex',
			xl: 'xl:flex',
			'2xl': '2xl:flex',
		}
		const menuDirectionOnUl = {
			sm: 'sm:menu-horizontal',
			md: 'md:menu-horizontal',
			lg: 'lg:menu-horizontal',
			xl: 'xl:menu-horizontal',
			'2xl': '2xl:menu-horizontal',
		}
		const justifyEnd = {
			sm: 'sm:justify-end',
			md: 'md:justify-end',
			lg: 'lg:justify-end',
			xl: 'xl:justify-end',
			'2xl': '2xl:justify-end',
		}
		const hideOnLargeScreen = {
			sm: 'sm:hidden',
			md: 'md:hidden ',
			lg: 'lg:hidden ',
			xl: 'xl:hidden ',
			'2xl': '2xl:hidden ',
		}
		const flexNone = {
			sm: 'sm:flex-none',
			md: 'md:flex-none',
			lg: 'lg:flex-none',
			xl: 'xl:flex-none',
			'2xl': '2xl:flex-none',
		}
		const flex = {
			sm: 'sm:flex',
			md: 'md:flex',
			lg: 'lg:flex',
			xl: 'xl:flex',
			'2xl': '2xl:flex',
		}
		const hidden = {
			sm: 'sm:hidden',
			md: 'md:hidden',
			lg: 'lg:hidden',
			xl: 'xl:hidden',
			'2xl': '2xl:hidden',
		}
		const smallScreenContainer = {
			sm: 'w-full basis-full overflow-y-auto max-h-96 sm:w-auto sm:basis-auto sm:overflow-visible sm:max-h-none',
			md: 'w-full basis-full overflow-y-auto max-h-96 md:w-auto md:basis-auto md:overflow-visible md:max-h-none',
			lg: 'w-full basis-full overflow-y-auto max-h-96 lg:w-auto lg:basis-auto lg:overflow-visible lg:max-h-none',
			xl: 'w-full basis-full overflow-y-auto max-h-96 xl:w-auto xl:basis-auto xl:overflow-visible xl:max-h-none',
			'2xl': 'w-full basis-full overflow-y-auto max-h-96 2xl:w-auto 2xl:basis-auto 2xl:overflow-visible 2xl:max-h-none',
		}
		const largeScreenContainer = {
			sm: 'sm:flex-1',
			md: 'md:flex-1',
			lg: 'lg:flex-1',
			xl: 'xl:flex-1',
			'2xl': '2xl:flex-1',
		}
		const mobileMenuHidden = {
			sm: 'mobile-menu-hidden-sm',
			md: 'mobile-menu-hidden-md',
			lg: 'mobile-menu-hidden-lg',
			xl: 'mobile-menu-hidden-xl',
			'2xl': 'mobile-menu-hidden-2xl',
		}
		return {
			isMenuOpen: false,
			shadowNone: shadowNone[this.collapseAt],
			orderLast: orderLast[this.collapseAt],
			desktopLayoutClassOnUl: desktopLayoutClassOnUl[this.collapseAt],
			menuDirectionOnUl: menuDirectionOnUl[this.collapseAt],
			justifyEnd: justifyEnd[this.collapseAt],
			hideOnLargeScreen: hideOnLargeScreen[this.collapseAt],
			flexNone: flexNone[this.collapseAt],
			flex: flex[this.collapseAt],
			hidden: hidden[this.collapseAt],
			smallScreenContainer: smallScreenContainer[this.collapseAt],
			largeScreenContainer: largeScreenContainer[this.collapseAt],
			mobileMenuHidden: mobileMenuHidden[this.collapseAt],
		}
	},
	watch: {
		'$route.path'() {
			this.isMenuOpen = false
		},
	},
	methods: {
		onClickInside(e) {
			consoleLog('clicked inside navbar')
			this.closeMenu(e)
		},
		windowClicked(e) {
			consoleLog('window clicked')
			this.closeMenu(e)
		},
		closeMenu(e) {
			if (!this.isMenuOpen) return

			if (this.keepOpenOnClick) {
				const hasOpenDropdown = document.querySelector('.v-popper__popper--shown')
				const hasClick = this.$refs.navbarRef?.contains(e?.target)
				const hasFocus = this.$refs.navbarRef?.contains(document.activeElement)

				if (hasClick || hasFocus || hasOpenDropdown) {
					return
				}
			}

			this.isMenuOpen = false
		},
	},
	mounted() {
		if (import.meta.browser) {
			this.$nextTick(() => {
				window.addEventListener('click', this.windowClicked)
			})
		}
	},
	beforeUnmount() {
		window.removeEventListener('click', this.windowClicked)
	},
}
</script>
