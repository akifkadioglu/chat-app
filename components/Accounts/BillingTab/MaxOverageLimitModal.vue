<template>
	<Modal ref="modal" size="max-w-2xl" bodyClass="p-2 md:p-4" @opened="onOpened">
		<article v-if="chatAccount && subscription" class="flex flex-col gap-7">
			<header class="flex flex-col gap-2">
				<h2 class="text-3xl md:text-4xl font-black tracking-tight leading-[1.05] mb-0">
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.title') }}
				</h2>
				<p class="text-base-content/80 leading-relaxed mb-0">
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.intro') }}
				</p>
			</header>

			<section class="flex flex-col gap-3">
				<div class="flex items-baseline justify-between gap-3 flex-wrap">
					<span class="text-sm font-medium">
						{{ $t('components.accounts.billingTab.maxOverageLimitModal.sliderLabel') }}
					</span>
					<div class="flex items-baseline gap-2">
						<input
							v-model="displayValue"
							type="text"
							inputmode="numeric"
							class="bg-transparent border-0 border-b border-base-300 focus:border-primary focus:rounded focus:outline-none w-32 text-2xl font-bold text-center px-1 py-1"
							@input="onInputChange"
							@focus="onInputFocus"
							@blur="onInputBlur"
						/>
					</div>
				</div>

				<div class="relative pt-7 pb-10">
					<div class="pointer-events-none absolute inset-x-0 top-0 h-7">
						<span
							v-if="planLimit"
							class="absolute -translate-x-1/2 flex flex-col items-center text-[10px] font-semibold text-primary"
							:style="{ left: position(planLimit) + '%' }"
						>
							<span class="size-2 rounded-full bg-primary mb-0.5" />
							<span class="whitespace-nowrap">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.markers.planLimit') }}
								· {{ $formatNumber(planLimit, $i18n.locale) }}
							</span>
						</span>

						<span
							v-if="showSeparateEffectiveLimit"
							class="absolute -translate-x-1/2 flex flex-col items-center text-[10px] font-semibold text-info"
							:style="{ left: position(effectiveLimit) + '%' }"
						>
							<span class="size-2 rounded-full bg-info mb-0.5" />
							<span class="whitespace-nowrap">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.markers.effectiveLimit') }}
								· {{ $formatNumber(effectiveLimit, $i18n.locale) }}
							</span>
						</span>
					</div>

					<div class="relative">
						<div
							class="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-base-300 overflow-hidden"
						>
							<div class="absolute inset-y-0 left-0 bg-primary/30" :style="{ width: position(currentLimit) + '%' }" />
							<div
								class="absolute inset-y-0 left-0 bg-primary"
								:style="{ width: position(Math.min(activeContactsCount, currentLimit)) + '%' }"
							/>
						</div>
						<div
							v-if="planLimit"
							class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full z-10"
							:style="{ left: position(planLimit) + '%' }"
						/>
						<div
							v-if="showSeparateEffectiveLimit"
							class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-5 bg-info rounded-full z-10"
							:style="{ left: position(effectiveLimit) + '%' }"
						/>
						<input
							v-model.number="sliderValue"
							type="range"
							min="0"
							max="100"
							step="0.1"
							class="range range-primary range-no-fill w-full relative"
							@input="onSliderInput"
						/>
					</div>

					<div class="pointer-events-none absolute inset-x-0 bottom-0 h-9">
						<span
							class="absolute -translate-x-1/2 flex flex-col items-center text-[10px] font-semibold text-warning"
							:style="{ left: position(currentLimit) + '%' }"
						>
							<span class="whitespace-nowrap">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.markers.yourCap') }}
								· {{ $formatNumber(currentLimit, $i18n.locale) }}
							</span>
						</span>

						<span
							class="absolute -translate-x-1/2 flex flex-col items-center text-[10px] font-semibold text-base-content/70"
							:style="{ left: position(activeContactsCount) + '%', top: '1.25rem' }"
						>
							<span class="whitespace-nowrap">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.markers.current') }}
								· {{ $formatNumber(activeContactsCount, $i18n.locale) }}
							</span>
						</span>
					</div>
				</div>

				<div class="flex flex-col gap-1 text-sm mt-2">
					<i18n-t keypath="components.accounts.billingTab.maxOverageLimitModal.summary.included" tag="div">
						<template #count>
							<span class="font-semibold text-base-content">
								{{
									$t('components.accounts.billingTab.maxOverageLimitModal.summary.contacts', {
										count: $formatNumber(effectiveLimit, $i18n.locale),
									})
								}}
								<a href="javascript:" class="link link-primary pl-2 no-underline" @click="onUpgrade">
									<u>{{ $t('components.accounts.billingTab.maxOverageLimitModal.summary.upgradePlan') }}</u>
									<i class="fa fa-arrow-up link-icon"></i>
								</a>
							</span>
						</template>
					</i18n-t>
					<i18n-t
						v-if="extraContactPrice > 0"
						keypath="components.accounts.billingTab.maxOverageLimitModal.summary.overage"
						tag="div"
					>
						<template #count>
							<span class="font-semibold text-base-content">
								{{
									$t('components.accounts.billingTab.maxOverageLimitModal.summary.contacts', {
										count: $formatNumber(capOverageContacts, $i18n.locale),
									})
								}}
							</span>
						</template>
						<template #amount>
							<AnimatedPrice
								class="font-semibold text-base-content"
								:exec-price="capOverageContacts * extraContactPrice"
								:symbol="currency?.symbol ?? '$'"
								:symbol-on-left="currency?.symbolOnLeft"
								:currency-code="currency?.code"
								:show-period="false"
								:animate="false"
							/>
						</template>
					</i18n-t>
				</div>
			</section>

			<div>
				<section class="rounded-lg border border-subtle bg-base-200/40 p-5 flex flex-col gap-4">
					<template v-if="extraContactPrice > 0 && capOverageContacts > 0">
						<header class="flex flex-col gap-1">
							<p class="text-xs uppercase tracking-wide text-muted font-semibold m-0">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.kicker') }}
							</p>
							<p class="text-base font-medium m-0">
								{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.title') }}
							</p>
						</header>

						<div class="flex items-baseline gap-2 flex-wrap">
							<AnimatedPrice
								class="text-4xl font-black text-base-content"
								:exec-price="capOverageContacts * extraContactPrice"
								:symbol="currency?.symbol ?? '$'"
								:symbol-on-left="!!currency?.symbolOnLeft"
								:currency-code="currency?.code"
								:show-period="false"
							/>
						</div>

						<i18n-t
							keypath="components.accounts.billingTab.maxOverageLimitModal.estimate.breakdown"
							tag="p"
							class="text-sm text-muted m-0"
						>
							<template #count>
								<span class="font-semibold text-base-content">
									{{ $formatNumber(capOverageContacts, $i18n.locale) }}
								</span>
							</template>
							<template #perContact>
								<AnimatedPrice
									:exec-price="extraContactPrice"
									:symbol="currency?.symbol ?? '$'"
									:symbol-on-left="!!currency?.symbolOnLeft"
									:currency-code="currency?.code"
									:decimals="3"
									:show-period="false"
									:animate="false"
								/>
							</template>
						</i18n-t>

						<div class="h-px bg-subtle" />

						<i18n-t
							keypath="components.accounts.billingTab.maxOverageLimitModal.estimate.upgradeHint"
							tag="p"
							class="text-xs text-subtle m-0"
						>
							<template #upgradeLink>
								<a href="javascript:" class="link link-primary font-semibold" @click="onUpgrade">
									{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.upgradeLinkLabel') }}
								</a>
							</template>
						</i18n-t>
					</template>
					<template v-else>
						<p class="text-sm font-semibold m-0">
							{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.title') }}
						</p>
						<p v-if="extraContactPrice > 0" class="text-sm text-muted m-0">
							{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.noOverage') }}
						</p>
						<p v-else class="text-sm text-muted m-0">
							{{ $t('components.accounts.billingTab.maxOverageLimitModal.estimate.unavailable') }}
						</p>
					</template>
				</section>
				<i18n-t
					v-if="periodValidAt"
					keypath="components.accounts.billingTab.maxOverageLimitModal.estimate.resetNote"
					tag="p"
					class="text-xs text-muted m-0 text-end gap-1.5"
				>
					<template #date>
						<span class="font-semibold">{{ $formatDate(periodValidAt, $i18n.locale) }}</span>
					</template>
				</i18n-t>
			</div>
		</article>
		<template #footerLeft>
			<div class="text-xs">
				<span v-if="saveState === 'saving'" class="text-muted">
					<i class="fa fa-spinner fa-spin mr-1" />
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.saving') }}
				</span>
				<span v-else-if="saveState === 'saved'" class="text-success">
					<i class="fa fa-check mr-1" />
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.savedJustNow') }}
				</span>
				<span v-else-if="saveState === 'error'" class="text-error">
					<i class="fa fa-triangle-exclamation mr-1" />
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.saveError') }}
				</span>
			</div>
		</template>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import AnimatedPrice from '~/components/Pricing/AnimatedPrice.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts.ts'
import { Subscription } from '~/models/Pricing/Subscription.ts'
import apiList from '~/apis/ApiList.js'
import pkg from 'lodash'

const { debounce } = pkg

const CEILING_MULTIPLIER = 4
const PLAN_LIMIT_SLIDER_POSITION = 40

export default {
	components: { Modal, AnimatedPrice },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			sliderValue: 0,
			currentLimit: 0,
			displayValue: '',
			isInputFocused: false,
			saveState: null,
			saveStateTimeout: null,
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
		subscription() {
			return this.chatAccount?.subscription ?? null
		},
		activeContactsCount() {
			return this.chatAccount.activeContactsCount
		},
		planLimit() {
			return this.subscription?.plan?.activeContactLimit ?? 0
		},
		effectiveLimit() {
			return this.subscription?.effectiveActiveContactLimit ?? this.planLimit
		},
		showSeparateEffectiveLimit() {
			return this.effectiveLimit && this.effectiveLimit !== this.planLimit
		},
		floor() {
			return Math.max(this.activeContactsCount, this.effectiveLimit)
		},
		ceiling() {
			const fromEffective = (this.effectiveLimit || 0) * CEILING_MULTIPLIER
			return Math.max(fromEffective, this.floor + 1, 1)
		},
		stepSize() {
			const c = this.ceiling
			if (c <= 1000) return 20
			if (c <= 5000) return 50
			if (c <= 20000) return 100
			if (c <= 100000) return 500
			return 1000
		},
		capOverageContacts() {
			return Math.max(0, this.currentLimit - this.effectiveLimit)
		},
		extraContactPrice() {
			const price = this.subscription?.plan_price ?? this.subscription.plan.price
			return Number(price?.extra_contact_price ?? price?.extraContactPrice ?? 0)
		},
		currency() {
			return this.subscription?.plan?.price?.currency ?? null
		},
		periodValidAt() {
			const sub = this.subscription
			return (
				sub?.currentPeriod?.validAt ??
				sub?.currentPeriod?.valid_at ??
				sub?.current_period?.valid_at ??
				sub?.validAt ??
				sub?.valid_at ??
				null
			)
		},
	},
	mounted() {
		this.$emitter.on('showMaxOverageLimitModal', this.showModal)
		this.debouncedSave = debounce(this.save, 500)
	},
	beforeUnmount() {
		this.$emitter.off('showMaxOverageLimitModal', this.showModal)
		if (this.debouncedSave?.cancel) this.debouncedSave.cancel()
		if (this.saveStateTimeout) clearTimeout(this.saveStateTimeout)
	},
	methods: {
		showModal() {
			this.syncFromAccount()
			this.$refs.modal?.showModal()
			this.fetchFreshPlanInfo()
		},
		fetchFreshPlanInfo() {
			if (!this.chatAccount?.id) return
			this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.planInfo, {
					chatAccountId: this.chatAccount.id,
				})
				.then((response) => {
					const sub = response?.data?.subscription
					if (!sub) return
					const newSubscription = new Subscription(sub)
					this.chatAccountsStore.entities[this.chatAccount.id].subscription = newSubscription
					this.applySubscription(newSubscription)
				})
				.catch(() => {})
		},
		onOpened() {
			this.syncFromAccount()
		},
		syncFromAccount() {
			this.applySubscription(this.subscription)
			this.saveState = null
		},
		applySubscription(sub) {
			const overageFromBackend = Number(sub?.effectiveMaxOverageLimit ?? 0) || 0
			const total = this.effectiveLimit + Math.max(0, overageFromBackend)
			const initial = Math.max(this.floor, total)
			this.currentLimit = initial
			this.sliderValue = this.valueToSlider(initial)
			this.refreshDisplayValue()
		},
		refreshDisplayValue() {
			if (this.isInputFocused) {
				this.displayValue = String(this.currentLimit)
			} else {
				this.displayValue = this.$formatNumber
					? this.$formatNumber(this.currentLimit, this.$i18n?.locale || 'en')
					: String(this.currentLimit)
			}
		},
		onInputFocus() {
			this.isInputFocused = true
			this.displayValue = String(this.currentLimit)
		},
		onInputBlur() {
			this.isInputFocused = false
			this.refreshDisplayValue()
		},
		onInputChange(event) {
			const raw = parseInt(String(event.target.value).replace(/[^\d]/g, ''), 10)
			if (Number.isNaN(raw)) return
			const enforced = Math.min(this.ceiling, Math.max(this.floor, raw))
			this.currentLimit = enforced
			this.sliderValue = this.valueToSlider(enforced)
			this.debouncedSave(this.currentLimit)
		},
		position(value) {
			return Math.max(0, Math.min(100, this.valueToSlider(value)))
		},
		valueToSlider(value) {
			const max = Math.max(1, this.ceiling)
			const pivot = Math.min(Math.max(this.effectiveLimit || 0, 0), max)
			const pivotPct = pivot > 0 && pivot < max ? PLAN_LIMIT_SLIDER_POSITION : pivot <= 0 ? 0 : 100
			const clamped = Math.max(0, Math.min(max, value))
			if (clamped <= pivot) {
				if (pivot <= 0) return pivotPct
				return (clamped / pivot) * pivotPct
			}
			const upperSpan = max - pivot
			if (upperSpan <= 0) return pivotPct
			return pivotPct + ((clamped - pivot) / upperSpan) * (100 - pivotPct)
		},
		sliderToValue(slider) {
			const max = Math.max(1, this.ceiling)
			const pivot = Math.min(Math.max(this.effectiveLimit || 0, 0), max)
			const pivotPct = pivot > 0 && pivot < max ? PLAN_LIMIT_SLIDER_POSITION : pivot <= 0 ? 0 : 100
			let value
			if (slider <= pivotPct) {
				value = pivotPct <= 0 ? pivot : (slider / pivotPct) * pivot
			} else {
				value = pivotPct >= 100 ? pivot : pivot + ((slider - pivotPct) / (100 - pivotPct)) * (max - pivot)
			}
			return Math.round(value)
		},
		onSliderInput() {
			const raw = this.sliderToValue(this.sliderValue)
			const snapped = this.snapToStep(raw)
			const enforced = Math.max(this.floor, snapped)
			this.currentLimit = enforced
			if (enforced !== raw) {
				this.sliderValue = this.valueToSlider(enforced)
			}
			this.refreshDisplayValue()
			this.debouncedSave(this.currentLimit)
		},
		snapToStep(value) {
			const step = this.stepSize
			if (step <= 1) return value
			const snapped = Math.round(value / step) * step
			return Math.min(this.ceiling, Math.max(0, snapped))
		},
		onUpgrade() {
			this.$refs.modal?.hideModal()
			this.$emitter.emit('showUpgradeModal', { chatAccount: this.chatAccount, feature: 'upgrade' })
		},
		save(value) {
			if (!this.chatAccount?.id) return
			const overagePayload = value == null ? null : Math.max(0, Number(value) - this.effectiveLimit)
			this.saveState = 'saving'
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscription.maxOverageLimit,
					{
						max_overage_limit: overagePayload,
					},
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((response) => {
					const sub = response?.data?.data?.subscription ?? response?.data?.subscription
					if (sub) {
						const newSubscription = new Subscription(sub)
						this.chatAccountsStore.entities[this.chatAccount.id].subscription = newSubscription
						this.applySubscription(newSubscription)
					}
					this.saveState = 'saved'
					this.flashSavedState()
				})
				.catch(() => {
					this.saveState = 'error'
				})
		},
		flashSavedState() {
			if (this.saveStateTimeout) clearTimeout(this.saveStateTimeout)
			this.saveStateTimeout = setTimeout(() => {
				if (this.saveState === 'saved') this.saveState = null
			}, 2500)
		},
	},
}
</script>

<style scoped>
.range-no-fill {
	--range-fill: 0;
	--range-bg: transparent;
	background: transparent;
}
.range-no-fill::-webkit-slider-runnable-track {
	background: transparent;
}
.range-no-fill::-moz-range-track {
	background: transparent;
}
.range-no-fill::-moz-range-progress {
	background: transparent;
}
</style>
