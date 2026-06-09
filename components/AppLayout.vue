<template>
	<div class="bg-base-100 flex rounded-lg h-full w-full">
		<SelectAccountModal ref="selectAccountModal" />
		<div class="flex h-full w-full">
			<slot name="sidebar">
				<!-- Account Selector Sidebar -->
				<div v-if="!adminPreview" class="shrink-0 h-full flex">
					<div class="drawer md:drawer-open w-min">
						<input v-model="leadingDrawer" type="checkbox" class="drawer-toggle hidden" />
						<div class="drawer-side h-full">
							<label @click="hideLeading" class="drawer-overlay" />
							<aside
								class="h-full border-r bg-base-100 border-base-100"
								:class="[$slots.sidebarTrailing ? sidebarTrailingWidthClasses : '', { flex: $slots.sidebarTrailing }]"
							>
								<!-- Account Selector  -->
								<AccountSelector
									:disableSelectAllAccount="disableSelectAllAccount"
									:disableAccountChange="disableAccountChange"
								/>
								<slot name="sidebarTrailing" />
							</aside>
						</div>
					</div>
				</div>
			</slot>

			<div class="flex flex-1 w-full overflow-hidden">
				<main class="flex flex-col flex-1 min-w-0">
					<div
						class="flex items-center justify-between gap-2 w-full"
						:class="contentHeaderHeight"
						v-if="$slots.contentHeader"
					>
						<div
							class="flex items-center flex-1 border-b border-base-300 px-2 w-full"
							:class="contentHeaderInnerClasses"
						>
							<label @click="openLeading" aria-label="close sidebar" class="drawer-overlay block md:hidden px-2">
								<i class="fa-solid fa-bars" />
							</label>
							<slot name="contentHeader" />
							<slot name="trailingToggleButtonOnHeader">
								<div class="flex gap-2">
									<slot name="secondTrailingToggleButton" @click="openSecondTrailing">
										<label
											v-if="$slots.secondTrailingContent"
											class="drawer-overlay block"
											:class="dynamicSecondHiddenClass"
											@click="openSecondTrailing"
										>
											<slot name="secondTrailingToggleButtonIcon">
												<i class="fa fa-cog" />
											</slot>
										</label>
									</slot>

									<slot name="trailingToggleButton">
										<label
											v-if="$slots.trailingContent || $slots.trailing"
											@click="openTrailing"
											class="drawer-overlay block"
											:class="dynamicHiddenClass"
										>
											<slot name="trailingToggleButtonIcon">
												<i class="fa fa-circle-info mr-2" />
											</slot>
										</label>
									</slot>
								</div>
							</slot>
						</div>
					</div>
					<div v-auto-animate>
						<AccountStatusBanner :activeAccount="chatAccountsStore.active" />
					</div>
					<div class="flex h-full overflow-hidden">
						<div
							ref="contentContainer"
							class="overflow-x-auto h-full relative flex flex-col"
							:class="mainContentClasses"
						>
							<slot v-if="$slots.contentWarning" name="contentWarning" />
							<slot />
							<AppFooter v-if="!hideFooter" />
						</div>
						<!-- İkinci Trailing Drawer -->
						<div class="h-full relative overflow-hidden" :class="secondTrailingContainerClasses" v-auto-animate>
							<div
								v-if="$slots.secondTrailingContent"
								class="drawer drawer-end w-full h-full flex border-l border-base-300"
								:class="dynamicSecondDrawerClass"
							>
								<input v-model="secondTrailingDrawer" type="checkbox" class="drawer-toggle hidden" />

								<div class="drawer-side h-full overflow-y-auto flex-1 w-full [scrollbar-gutter:stable]">
									<label @click="hideSecondTrailing" class="drawer-overlay" />
									<aside
										class="bg-base-100 min-h-full flex"
										:class="[secondTrailingWidthClasses]"
										:style="secondTrailingStyle"
									>
										<slot name="secondTrailingContent" />
									</aside>
								</div>
							</div>
						</div>
					</div>
				</main>
				<slot name="trailing">
					<div class="flex overflow-hidden" v-auto-animate>
						<!-- Birinci Trailing Drawer -->
						<div class="drawer drawer-end w-min" :class="dynamicDrawerClass" v-if="$slots.trailingContent">
							<input v-model="trailingDrawer" type="checkbox" class="drawer-toggle hidden" />
							<div class="drawer-side h-full overflow-y-auto [scrollbar-gutter:stable]">
								<label @click="hideTrailing" class="drawer-overlay" />
								<aside
									class="bg-base-100 flex border-l border-base-300 flex-col min-h-full"
									:class="[dynamicAsideClass, trailingWidthClasses]"
								>
									<slot name="trailingContent" />
								</aside>
							</div>
						</div>
					</div>
				</slot>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import AccountSelector from '~/components/Chat/Sidebar/AccountSelector.vue'
import SelectAccountModal from '~/components/Flow/SelectAccountModal.vue'
import AccountStatusBanner from '~/components/BaseComponents/AccountStatusBanner.vue'
import { STATUS } from '~/models/ChatAccount.ts'

export default defineComponent({
	components: {
		AccountStatusBanner,
		SelectAccountModal,
		AccountSelector,
	},
	props: {
		mainContentClasses: {
			type: String,
			default: 'w-full',
		},
		sidebarTrailingWidthClasses: {
			type: String,
			default: 'w-4/5 max-w-96 lg:min-w-96',
		},
		trailingShowSize: {
			type: String,
			default: 'lg',
		},
		trailingWidthClasses: {
			type: String,
			default: 'w-4/5 max-w-80 xl:w-96 ',
		},
		secondTrailingShowSize: {
			type: String,
			default: 'lg',
		},
		secondTrailingWidthClasses: {
			type: String,
			default: 'w-4/5 max-w-80 xl:w-96 ',
		},
		secondTrailingStyle: {
			type: Object,
			default: () => ({}),
		},
		secondTrailingContainerClasses: {
			type: String,
			default: '',
		},
		contentHeaderHeight: {
			type: String,
			default: '',
		},
		contentHeaderInnerClasses: {
			type: String,
			default: '!h-15',
		},
		disableSelectAllAccount: {
			type: Boolean,
			default: false,
		},
		disableAccountChange: {
			type: Boolean,
			default: false,
		},
		hideFooter: {
			type: Boolean,
			default: false,
		},
		showSecondTrailingWidthClasses: {
			type: Boolean,
			default: true,
		},
		adminPreview: {
			type: Boolean,
			default: false,
		},
	},
	provide() {
		return {
			getContentContainer: () => this.$refs.contentContainer,
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	watch: {
		'$route.query.username': {
			handler(newUsername) {
				consoleLog('trrqu watching $route.query.username', newUsername)

				const accountId = this.chatAccountsStore.byUsername(newUsername)?.id
				this.chatAccountsStore.setActive(accountId)

				if (this.disableSelectAllAccount && !newUsername) {
					this.$emitter.emit('showSelectAccountModal')
					// this.allAccountsSelectedBefore = true
				}
				if (newUsername) {
					this.$emitter.emit('hideSelectAccountModal')
				}

				this.$emit('selectedAccountChanged', this.chatAccountsStore.active)
			},
			immediate: true, // id ile flow'a girince çalıştıramıyoruz
		},
	},
	emits: ['selectedAccountChanged'],
	data() {
		return {
			leadingDrawer: false,
			trailingDrawer: false,
			secondTrailingDrawer: false,
		}
	},
	computed: {
		dynamicDrawerClass() {
			// Sadece dinamik breakpoint class'ı
			const sizeClasses = {
				sm: 'sm:drawer-open',
				md: 'md:drawer-open',
				lg: 'lg:drawer-open',
				xl: 'xl:drawer-open',
				'2xl': '2xl:drawer-open',
			}
			return sizeClasses[this.trailingShowSize] || sizeClasses.lg
		},
		dynamicAsideClass() {
			// Sadece dinamik responsive width class'ları
			const sizeClasses = {
				sm: 'sm:w-72',
				md: 'md:w-72',
				lg: 'lg:w-72',
				xl: 'xl:w-72',
				'2xl': '2xl:w-72',
			}
			return sizeClasses[this.trailingShowSize] || sizeClasses.lg
		},
		dynamicHiddenClass() {
			// Sadece dinamik hidden class'ı
			const hiddenClasses = {
				sm: 'sm:hidden',
				md: 'md:hidden',
				lg: 'lg:hidden',
				xl: 'xl:hidden',
				'2xl': '2xl:hidden',
			}
			return hiddenClasses[this.trailingShowSize] || hiddenClasses.lg
		},
		dynamicSecondHiddenClass() {
			// Sadece dinamik hidden class'ı
			const hiddenClasses = {
				sm: 'sm:hidden',
				md: 'md:hidden',
				lg: 'lg:hidden',
				xl: 'xl:hidden',
				'2xl': '2xl:hidden',
			}
			return hiddenClasses[this.secondTrailingShowSize] || hiddenClasses.lg
		},
		dynamicSecondDrawerClass() {
			// İkinci drawer için dinamik breakpoint class'ı
			const sizeClasses = {
				sm: 'sm:drawer-open',
				md: 'md:drawer-open',
				lg: 'lg:drawer-open',
				xl: 'xl:drawer-open',
				'2xl': '2xl:drawer-open',
			}
			return sizeClasses[this.secondTrailingShowSize] || sizeClasses.lg
		},
		dynamicSecondAsideClass() {
			// İkinci drawer için dinamik responsive width class'ları
			const sizeClasses = {
				sm: 'sm:w-72',
				md: 'md:w-72',
				lg: 'lg:w-72',
				xl: 'xl:w-72',
				'2xl': '2xl:w-72',
			}
			return sizeClasses[this.secondTrailingShowSize] || sizeClasses.lg
		},
		// showAccountStatusBanner() {
		// if (this.chatAccountsStore.active?.status === STATUS.PASSIVE) return true
		// if (this.chatAccountsStore.active?.reachedContactLimit) return true
		// return false
		// },
	},
	mounted() {
		this.$emitter.on('hideLeadingDrawer', this.hideLeading)
		this.$emitter.on('openLeadingDrawer', this.openLeading)
		this.$emitter.on('hideTrailingDrawer', this.hideTrailing)
		this.$emitter.on('openTrailingDrawer', this.openTrailing)
		this.$emitter.on('hideSecondTrailingDrawer', this.hideSecondTrailing)
		this.$emitter.on('openSecondTrailingDrawer', this.openSecondTrailing)
	},
	methods: {
		openTrailing() {
			this.trailingDrawer = true
			this.$emitter.emit('trailingDrawerOpened')
		},
		hideTrailing() {
			this.trailingDrawer = false
			this.$emitter.emit('trailingDrawerClosed')
		},
		openSecondTrailing() {
			this.secondTrailingDrawer = true
		},
		hideSecondTrailing() {
			this.secondTrailingDrawer = false
		},
		openLeading() {
			this.leadingDrawer = true
		},
		hideLeading() {
			this.leadingDrawer = false
		},
	},
})
</script>
