<template>
	<div v-if="itemGroups.length && itemGroups.length > 1" class="rounded-lg border border-subtle p-5 mb-4 space-y-2">
		<div
			v-for="group in itemGroups"
			:key="group.key"
			class="flex justify-between text-sm"
			:class="{ 'text-success': group.isCovered }"
		>
			<span>{{ group.label }}</span>
			<span v-html="formatWithCurrency(group.amount, group.currencyCode)" />
		</div>
		<div v-if="paymentIntent" class="flex justify-between items-center pt-2 border-t border-subtle">
			<span class="text-sm">{{ $t('pages.app.pay.subscription.upgradeCard.toBeChargedText') }}</span>
			<span class="text-subscribe text-lg font-medium" v-html="formattedToBeCharged" />
		</div>
	</div>
</template>

<script>
const LABEL_KEYS = {
	'SubscriptionPlan:new': 'pages.app.pay.subscription.upgradeCard.amount.new.subscription',
	'Subscription:covered': 'pages.app.pay.subscription.upgradeCard.amount.covered.subscription',
	'SubscriptionAccount:new': 'pages.app.pay.subscription.upgradeCard.amount.new.accounts',
	'SubscriptionAccount:covered': 'pages.app.pay.subscription.upgradeCard.amount.covered.accounts',
}

export default {
	props: {
		paymentIntent: {
			type: Object,
			default: null,
		},
	},
	computed: {
		itemGroups() {
			const items = this.paymentIntent?.items ?? []
			const groups = new Map()
			items.forEach((item) => {
				const modelKey = (item.model_type ?? '').split('\\').pop()
				const amount = parseFloat(item.amount) || 0
				const isCovered = amount <= 0
				const key = `${modelKey}:${isCovered ? 'covered' : 'new'}`
				if (!groups.has(key)) {
					groups.set(key, {
						key,
						modelKey,
						isCovered,
						amount: 0,
						count: 0,
						currencyCode: item.currency_code ?? this.paymentIntent?.currency_code ?? '',
						sample: item,
					})
				}
				const group = groups.get(key)
				group.amount += amount
				group.count += 1
			})
			return Array.from(groups.values()).map((group) => ({
				...group,
				label: this.labelFor(group),
			}))
		},
		formattedToBeCharged() {
			return this.formatWithCurrency(this.paymentIntent?.amount, this.paymentIntent?.currency_code ?? '')
		},
	},
	methods: {
		labelFor(group) {
			const i18nKey = LABEL_KEYS[group.key]
			if (i18nKey) {
				return this.$t(i18nKey, { count: group.count })
			}
			return group.sample?.label ?? group.sample?.name ?? group.modelKey
		},
		formatWithCurrency(amount, currencyCode) {
			const value = this.$formatPrice(amount ?? 0, this.$i18n.locale, currencyCode)
			return `${value} ${currencyCode}`
		},
	},
}
</script>
