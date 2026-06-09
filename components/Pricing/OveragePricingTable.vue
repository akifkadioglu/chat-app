<template>
	<section v-if="planGroups.length" class="w-full">
		<div class="hidden lg:block mb-10">
			<PeriodToggle :initial-value="period" @change="periodChange" />
		</div>

		<hr class="hidden lg:block border-t border-base-content/10 my-0" />

		<div
			class="flex gap-1 mb-8 bg-muted p-1 rounded-full lg:bg-transparent! lg:p-0 lg:rounded-none lg:gap-x-8 lg:m-0 lg:py-12 lg:grid items-start"
			:class="gridCols"
		>
			<h3 class="hidden lg:block text-2xl md:text-3xl font-black tracking-tight mb-0">
				{{ $t('components.pricing.overagePricingTable.chooseTitle') }}
			</h3>

			<div
				v-for="group in planGroups"
				:key="group.groupKey"
				role="button"
				tabindex="0"
				class="flex-1 rounded-full px-2 py-2 text-center transition lg:flex-none lg:rounded-none lg:bg-transparent lg:shadow-none lg:cursor-default lg:my-2 lg:px-2 lg:py-2"
				:class="{
					'bg-base-100 shadow-lg lg:bg-transparent lg:shadow-none': isActive(group),
					'text-base-content/70 hover:text-primary lg:text-base-content': !isActive(group),
				}"
				@click="selectGroupKey(group.groupKey)"
			>
				<div class="flex flex-col lg:gap-1.5 lg:items-center">
					<span class="text-xs font-semibold tracking-normal lg:text-lg lg:font-bold">
						{{
							$t('components.pricing.overagePricingTable.contacts', {
								contactsCount: $formatNumber(group.activeContactLimit, $i18n.locale),
							})
						}}
					</span>
					<AnimatedPrice
						v-if="planMonthlyExec(group) !== null"
						class="hidden lg:inline text-xl lg:text-2xl tracking-tight text-base-content tabular-nums"
						:execPrice="planMonthlyExec(group)"
						:symbol="planSymbol(group)"
						:symbolOnLeft="planSymbolOnLeft(group)"
					/>
				</div>
			</div>
		</div>

		<hr class="hidden lg:block border-t border-base-content/10 my-0" />

		<div class="flex flex-col gap-2 py-5">
			<h3 class="text-2xl md:text-3xl font-black tracking-tight m-0">
				{{ $t('components.pricing.overagePricingTable.overageTitle') }}
			</h3>
			<p class="text-sm text-muted m-0 flex items-start gap-2 max-w-2xl">
				<i class="fa fa-shield-halved mt-0.5 text-primary" />
				<span>{{ $t('components.pricing.overagePricingTable.capReassurance') }}</span>
			</p>
		</div>

		<div
			v-for="row in visibleRows"
			:key="row.key"
			class="grid grid-cols-[1.2fr_1fr] gap-6 items-start py-7 border-t border-base-content/10 lg:gap-x-8 lg:py-8 lg:border-0"
			:class="gridCols"
		>
			<div class="text-base text-base-content/85 max-w-72 self-center">
				<div class="font-semibold text-base-content">
					{{ $t(`components.pricing.overagePricingTable.rows.${row.key}.period`) }}
				</div>
				<div class="text-sm text-muted mt-0.5">
					{{ $t(`components.pricing.overagePricingTable.rows.${row.key}.label`) }}
				</div>
			</div>
			<div
				v-for="group in planGroups"
				:key="group.groupKey"
				class="text-right data-[active=false]:hidden lg:text-center lg:data-[active=false]:block self-center"
				:data-active="group.groupKey === selectedPlanGroupKey ? 'true' : 'false'"
			>
				<template v-if="row.type === 'unlimited'">
					<span class="text-lg font-bold text-base-content leading-none">
						<i class="fa fa-infinity"></i>
					</span>
					<div class="text-xs text-muted font-medium mt-1">
						{{ $t('components.pricing.overagePricingTable.unlimited') }}
					</div>
				</template>
				<template v-else-if="extraContactPrice(group, row.period) === null">
					<span class="text-base italic text-subtle">
						{{ $t('components.pricing.overagePricingTable.notAvailable') }}
					</span>
				</template>
				<template v-else>
					<div class="flex items-baseline gap-1 justify-end lg:justify-center">
						<span class="text-base font-semibold text-muted tabular-nums">
							<span v-if="planSymbolOnLeft(group)">{{ planSymbol(group) }}</span>
							<AnimatedNumber
								:end-number="Number(extraContactPrice(group, row.period))"
								:decimals="priceDecimals(extraContactPrice(group, row.period))"
							/>
							<span v-if="!planSymbolOnLeft(group)">{{ planSymbol(group) }}</span>
						</span>
					</div>
					<div class="text-xs text-muted font-medium">
						/ {{ $t('components.pricing.overagePricingTable.perContact') }}
					</div>
				</template>
			</div>
		</div>

		<div
			class="grid grid-cols-[1.2fr_1fr] gap-6 items-center pt-7 border-t border-base-content/10 lg:gap-x-8 lg:pt-2 lg:border-0"
			:class="gridCols"
		>
			<div class="hidden lg:block" />
			<div
				v-for="group in planGroups"
				:key="group.groupKey"
				class="text-right data-[active=false]:hidden lg:text-center lg:data-[active=false]:block"
				:data-active="group.groupKey === selectedPlanGroupKey ? 'true' : 'false'"
			>
				<button
					type="button"
					class="btn btn-primary btn-transition lg:btn-soft lg:px-5 lg:ml-auto"
					@click="selectPlan(group)"
				>
					{{ $t('components.pricing.overagePricingTable.ctas.getStarted') }}
					<i class="fa fa-chevron-right link-icon"></i>
				</button>
			</div>
		</div>

		<i18n-t keypath="components.pricing.overagePricingTable.footerNote" tag="p" class="text-sm text-muted mt-6 lg:mt-8">
			<template #link>
				<a
					href="javascript:"
					class="link link-primary underline decoration-dotted underline-offset-2 font-semibold hover:brightness-75"
					@click.prevent="openActiveContactsInfoModal"
				>
					{{ $t('components.pricing.overagePricingTable.footerNoteLink') }}
				</a>
			</template>
		</i18n-t>

		<div class="hidden lg:block divider" />
	</section>
</template>

<script>
import PeriodToggle from '~/components/Pricing/PeriodToggle.vue'
import AnimatedPrice from '~/components/Pricing/AnimatedPrice.vue'
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import { PERIODS } from '~/models/Pricing/Plan.ts'

export default {
	components: { PeriodToggle, AnimatedPrice, AnimatedNumber },
	setup() {
		return {
			productsStore: useProductsStore(),
		}
	},
	data() {
		return {
			period: PERIODS.yearly,
			selectedPlanGroupKey: null,
			gridCols: 'lg:grid-cols-[minmax(200px,1.4fr)_repeat(4,minmax(140px,1fr))]',
			overageRows: [
				{ key: 'messages', type: 'unlimited' },
				{ key: 'comments', type: 'unlimited' },
				{ key: 'automations', type: 'unlimited' },
				{ key: 'teammates', type: 'unlimited' },
				{ key: 'monthly', type: 'overage', period: PERIODS.monthly },
				{ key: 'annual', type: 'overage', period: PERIODS.yearly },
			],
		}
	},
	computed: {
		planGroups() {
			return this.productsStore?.subscriptionPlans ?? []
		},
		visibleRows() {
			return this.overageRows.filter((row) => row.type !== 'overage' || row.period === this.period)
		},
	},
	mounted() {
		this.productsStore.getProducts().then(() => {
			if (!this.selectedPlanGroupKey && this.planGroups.length) {
				this.selectedPlanGroupKey = this.planGroups[0].groupKey
			}
		})
		this.$emitter.on('planGroupKeyChange', this.syncGroupKey)
		this.$emitter.on('periodToggleChange', this.syncPeriod)
	},
	beforeUnmount() {
		this.$emitter.off('planGroupKeyChange', this.syncGroupKey)
		this.$emitter.off('periodToggleChange', this.syncPeriod)
	},
	methods: {
		isActive(group) {
			return this.selectedPlanGroupKey === group.groupKey
		},
		periodChange(period) {
			if (this.period === period) return
			this.period = period
			this.$emitter.emit('periodToggleChange', period)
		},
		syncPeriod(period) {
			this.period = period
		},
		selectGroupKey(key) {
			if (this.selectedPlanGroupKey === key) return
			this.selectedPlanGroupKey = key
			this.$emitter.emit('planGroupKeyChange', key)
		},
		syncGroupKey(key) {
			this.selectedPlanGroupKey = key
		},
		selectPlan(group) {
			this.selectGroupKey(group.groupKey)
			this.$emit('select-plan', { group, period: this.period })
		},
		findPlan(group, period) {
			return group?.plans?.find((p) => p.period === period) ?? null
		},
		planSymbol(group) {
			const plan = this.findPlan(group, this.period) ?? this.findPlan(group, PERIODS.monthly)
			return plan?.price?.currency?.symbol ?? '$'
		},
		planSymbolOnLeft(group) {
			const plan = this.findPlan(group, this.period) ?? this.findPlan(group, PERIODS.monthly)
			return plan?.price?.currency?.symbolOnLeft ?? true
		},
		planMonthlyExec(group) {
			const plan = this.findPlan(group, this.period)
			const price = plan?.price?.price
			if (price == null) return null
			return this.period === PERIODS.yearly ? price / 12 : price
		},
		extraContactPrice(group, period) {
			const plan = this.findPlan(group, period)
			return plan?.price?.extraContactPrice ?? null
		},
		openActiveContactsInfoModal() {
			this.$emitter.emit('showActiveContactsInfoModal')
		},
		priceDecimals(amount) {
			if (amount == null) return 2
			const str = String(amount).replace(/0+$/, '')
			const dot = str.indexOf('.')
			if (dot === -1) return 0
			return Math.max(2, str.length - dot - 1)
		},
	},
}
</script>
