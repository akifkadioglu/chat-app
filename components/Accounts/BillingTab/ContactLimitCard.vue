<template>
	<div>
		<section
			v-if="subscription"
			class="rounded-xl border overflow-hidden"
			:class="hasOverage ? 'border-info/40 bg-info/5' : 'border-subtle'"
		>
			<header class="flex items-start justify-between gap-4 px-5 py-4">
				<div class="min-w-0">
					<h4 class="text-lg font-bold m-0 flex items-center gap-2" :class="hasOverage ? 'text-info' : ''">
						<i :class="hasOverage ? 'fa fa-circle-info' : 'fa fa-shield-halved text-primary'" />
						<template v-if="hasOverage">
							<i18n-t keypath="components.accounts.billingTab.contactLimitCard.overage.title" tag="span">
								<template #count>
									<AnimatedNumber :end-number="overageContactsCount" :animate="false" />
								</template>
							</i18n-t>
						</template>
						<template v-else>
							{{ $t('components.accounts.billingTab.contactLimitCard.idle.title') }}
						</template>
					</h4>
					<p class="text-sm text-muted m-0 mt-1">
						<template v-if="hasOverage">
							<i18n-t keypath="components.accounts.billingTab.contactLimitCard.overage.subtitle" tag="span">
								<template #amount>
									<AnimatedPrice
										:exec-price="estimatedAmount"
										:symbol="currency?.symbol ?? '$'"
										:symbol-on-left="!!currency?.symbolOnLeft"
										:currency-code="currency?.code"
										:show-period="false"
										:animate="false"
										class="font-semibold text-base-content"
									/>
								</template>
							</i18n-t>
						</template>
						<template v-else>
							{{ $t('components.accounts.billingTab.contactLimitCard.idle.subtitle') }}
						</template>
					</p>
				</div>
				<button
					class="btn btn-sm btn-transition shrink-0 gap-1.5"
					:class="hasOverage ? 'btn-info' : 'btn-primary'"
					@click="$emitter.emit('showMaxOverageLimitModal')"
				>
					<i class="fa fa-sliders" />
					{{ $t('components.accounts.billingTab.maxOverageLimitModal.openButton') }}
				</button>
			</header>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-subtle/60">
				<div class="bg-base-100 px-5 py-3">
					<p class="text-[11px] uppercase tracking-wide text-muted font-semibold m-0">
						{{ $t('components.accounts.billingTab.contactLimitCard.stats.inUse') }}
					</p>
					<p class="text-base font-semibold m-0 mt-0.5">
						{{ $formatNumber(activeContactsCount, $i18n.locale) }}
						<span class="text-xs text-subtle">Contacts</span>
					</p>
				</div>
				<div class="bg-base-100 px-5 py-3">
					<p class="text-[11px] uppercase tracking-wide text-muted font-semibold m-0">
						{{ $t('components.accounts.billingTab.contactLimitCard.stats.planLimit') }}
					</p>
					<p class="text-base font-semibold m-0 mt-0.5">
						{{ $formatNumber(contactLimit, $i18n.locale) }}
						<span class="text-xs text-subtle">Contacts</span>
					</p>
				</div>
				<div class="bg-base-100 px-5 py-3">
					<p class="text-[11px] uppercase tracking-wide text-muted font-semibold m-0">
						{{ $t('components.accounts.billingTab.contactLimitCard.stats.overageCap') }}
					</p>
					<p class="text-base font-semibold m-0 mt-0.5">
						<template v-if="effectiveMaxOverageLimit">
							{{ $formatNumber(effectiveMaxOverageLimit, $i18n.locale) }}
							<span class="text-xs text-subtle">
								{{ $t('components.accounts.billingTab.contactLimitCard.stats.contactsSuffix') }}
							</span>
						</template>
						<span v-else class="text-muted">—</span>
					</p>
				</div>
			</div>

			<footer
				class="px-5 py-3 text-xs flex items-start gap-2"
				:class="hasOverage ? 'text-base-content/85' : 'text-muted'"
			>
				<i class="fa fa-circle-info mt-0.5 shrink-0" />
				<span v-if="hasOverage">
					{{ $t('components.accounts.billingTab.contactLimitCard.overage.reassurance') }}
					<a href="javascript:" class="link link-primary font-semibold ml-1" @click="onUpgrade">
						{{ $t('components.accounts.billingTab.contactLimitCard.upgradeLinkLabel') }}
					</a>
				</span>
				<span v-else>
					{{ $t('components.accounts.billingTab.contactLimitCard.idle.hint') }}
				</span>
			</footer>
		</section>
		<i18n-t
			v-if="subscription?.current_period?.valid_at"
			keypath="components.accounts.billingTab.maxOverageLimitModal.estimate.resetNote"
			tag="p"
			class="text-xs text-muted m-0 text-end gap-1.5"
		>
			<template #date>
				<span class="font-semibold">{{ $formatDate(subscription?.current_period?.valid_at, $i18n.locale) }}</span>
			</template>
		</i18n-t>
	</div>
</template>

<script>
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import AnimatedPrice from '~/components/Pricing/AnimatedPrice.vue'

export default {
	components: { AnimatedNumber, AnimatedPrice },
	props: {
		subscription: { type: Object, required: true },
		activeContactsCount: { type: Number, default: 0 },
		contactLimit: { type: Number, required: true },
		overageContactsCount: { type: Number, default: 0 },
		effectiveMaxOverageLimit: { type: Number, default: null },
	},
	computed: {
		hasOverage() {
			return this.overageContactsCount > 0
		},
		extraContactPrice() {
			const price = this.subscription?.plan?.price
			return Number(price?.extra_contact_price ?? price?.extraContactPrice ?? 0)
		},
		currency() {
			return this.subscription?.plan?.price?.currency ?? null
		},
		estimatedAmount() {
			return this.overageContactsCount * this.extraContactPrice
		},
	},
	methods: {
		onUpgrade() {
			this.$emitter.emit('showUpgradeModal', { feature: 'upgrade' })
		},
	},
}
</script>
