<template>
	<div class="rounded-lg border border-subtle bg-base-100">
		<div class="p-6 sm:p-8 space-y-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<p class="text-base font-semibold m-0">
						{{ $t('components.accounts.billingTab.planBillingTab.subscriptionCard.title') }}
					</p>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium">
						<i class="fa fa-users mr-2"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.subscriptionCard.contacts.activeLabel') }}
					</span>
					<span class="font-mono">
						{{ $formatNumber(contactsCount, $i18n.locale) }} /
						{{ $formatNumber(contactLimit, $i18n.locale) }}
					</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div
						class="h-3 rounded-full transition-all duration-300"
						:style="{ width: Math.min(Math.round(barPercent), 100) + '%', minWidth: barPercent > 0 ? '12px' : '0' }"
						:class="barPercent > 100 ? 'bg-warning' : 'bg-primary'"
					></div>
				</div>
				<div class="text-xs" :class="barPercent > 100 ? 'text-warning' : 'text-base-content/70'">
					<i18n-t keypath="components.accounts.billingTab.planBillingTab.usage.used">
						<template #percentage>{{ Math.round(barPercent) }}</template>
					</i18n-t>
					<span v-if="barPercent > 100" class="ml-2">
						• {{ $t('components.accounts.billingTab.planBillingTab.usage.exceedLimitText') }}
					</span>
				</div>
				<div class="flex items-center justify-between gap-3 flex-wrap text-xs text-muted pt-1">
					<i18n-t
						v-if="showOverageCapMarker"
						keypath="components.accounts.billingTab.planBillingTab.subscriptionCard.contacts.overageCap"
						tag="span"
						class="flex items-center gap-1.5"
					>
						<template #count>
							<a
								href="javascript:"
								class="font-semibold text-base-content no-underline hover:underline inline-flex items-baseline gap-1"
								@click="$emitter.emit('showMaxOverageLimitModal')"
							>
								{{ $formatNumber(contactLimit + maxOverageLimit, $i18n.locale) }}
								<i class="fa fa-pen text-[10px] text-primary" />
							</a>
						</template>
					</i18n-t>
					<span v-else />
					<!--					<a-->
					<!--						href="javascript:"-->
					<!--						class="link link-primary no-underline hover:underline shrink-0"-->
					<!--						@click="$emitter.emit('showMaxOverageLimitModal')"-->
					<!--					>-->
					<!--						<i class="fa fa-sliders mr-1 text-[10px]" />-->
					<!--						{{ $t('components.accounts.billingTab.maxOverageLimitModal.openButton') }}-->
					<!--					</a>-->
				</div>
			</div>

			<!-- Comments Usage -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium">
						<i class="fa fa-comments mr-2"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.usage.comments') }}
					</span>
					<span class="font-mono">{{ $formatNumber(commentsCount || 0, $i18n.locale) }} / ∞</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div class="bg-success h-3 rounded-full w-full transition-all duration-300"></div>
				</div>
				<div class="text-xs text-success font-medium">
					{{ $t('components.accounts.billingTab.planBillingTab.usage.unlimited') }}
				</div>
			</div>

			<!-- Analysis Usage -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium">
						<i class="fa fa-chart-line mr-2"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.usage.aiAnalysis') }}
					</span>
					<span class="font-mono">{{ $formatNumber(analysisCount || 0, $i18n.locale) }} / ∞</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div class="bg-success h-3 rounded-full w-full transition-all duration-300"></div>
				</div>
				<div class="text-xs text-success font-medium">
					{{ $t('components.accounts.billingTab.planBillingTab.usage.unlimited') }}
				</div>
			</div>

			<!-- Message Count Usage -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium">
						<i class="fa fa-envelope mr-2"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.usage.messages') }}
					</span>
					<span class="font-mono">{{ $formatNumber(messagesCount || 0, $i18n.locale) }} / ∞</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div class="bg-success h-3 rounded-full w-full transition-all duration-300"></div>
				</div>
				<div class="text-xs text-success font-medium">
					{{ $t('components.accounts.billingTab.planBillingTab.usage.unlimited') }}
				</div>
			</div>

			<!-- Flow Run Usage -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium">
						<i class="fa fa-play-circle mr-2" />
						{{ $t('components.accounts.billingTab.planBillingTab.usage.flowRuns') }}
					</span>
					<span class="font-mono">{{ $formatNumber(flowRunsCount || 0, $i18n.locale) }} / ∞</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div class="bg-success h-3 rounded-full w-full transition-all duration-300"></div>
				</div>
				<div class="text-xs text-success font-medium">
					{{ $t('components.accounts.billingTab.planBillingTab.usage.unlimited') }}
				</div>
			</div>
		</div>

		<div class="h-px bg-subtle"></div>

		<div class="px-6 sm:px-8 py-3 flex items-center justify-end gap-4 flex-wrap bg-base-200/30">
			<div v-if="periodInfo" class="inline-flex items-center gap-2.5 flex-wrap">
				<template v-if="periodInfo.type === 'subscription'">
					<span
						class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold"
					>
						<i class="fa fa-circle-check text-[9px]"></i>
						{{ periodInfo.label }}
					</span>
					<span class="text-xs text-muted tabular-nums">
						{{ $formatDate(periodInfo.started_at, $i18n.locale) }} –
						{{ $formatDate(periodInfo.ended_at, $i18n.locale) }}
					</span>
					<span v-if="daysLeft > 0" class="text-xs text-muted">
						·
						<i18n-t keypath="components.accounts.billingTab.planBillingTab.subscriptionCard.daysLeft" tag="span">
							<template #days>
								<span class="font-semibold text-base-content">{{ daysLeft }}</span>
							</template>
						</i18n-t>
					</span>
					<span v-else class="inline-flex items-center gap-1 text-xs text-warning font-medium">
						<i class="fa fa-clock text-[10px]"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.subscriptionCard.renewalPending') }}
					</span>
				</template>
				<template v-else>
					<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-muted text-sm">
						<i class="fa fa-calendar text-[9px]"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.subscriptionCard.freePlanLabel') }} ·
						{{ periodInfo.label }}
					</span>
					<button class="btn btn-primary btn-sm btn-transition gap-1.5" @click="$emit('upgrade')">
						<i class="fa fa-bolt text-[10px]"></i>
						{{ $t('components.accounts.billingTab.planBillingTab.subscriptionCard.upgrade') }}
					</button>
				</template>
			</div>
		</div>
	</div>

	<!-- Usage Statistics -->
	<div class="mt-8">
		<div class="pl-4 space-y-6">
			<!-- Team Member Usage -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="font-medium"
						><i class="fa fa-user-friends mr-2"></i
						>{{ $t('components.accounts.billingTab.planBillingTab.usage.teamMembers') }}</span
					>
					<span class="font-mono">{{ teamUsersCount || 0 }} / ∞</span>
				</div>
				<div class="w-full bg-base-300 rounded-full h-3">
					<div class="bg-success h-3 rounded-full w-full transition-all duration-300"></div>
				</div>
				<div class="text-xs text-success font-medium">
					{{ $t('components.accounts.billingTab.planBillingTab.usage.unlimited') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		contactsCount: { type: Number, default: 0 },
		contactLimit: { type: Number, required: true },
		maxOverageLimit: { type: Number, default: 0 },
		messagesCount: { type: Number, default: 0 },
		commentsCount: { type: Number, default: 0 },
		analysisCount: { type: Number, default: 0 },
		flowRunsCount: { type: Number, default: 0 },
		teamUsersCount: { type: Number, default: 0 },
		isFree: { type: Boolean, default: false },
		periodInfo: {
			type: Object,
			default: null,
		},
	},
	emits: ['upgrade'],
	computed: {
		barPercent() {
			if (!this.contactLimit) return 0
			const pct = ((this.contactsCount || 0) / this.contactLimit) * 100
			return Math.min(100, Math.max(0, pct))
		},
		showOverageCapMarker() {
			return this.maxOverageLimit > 0
		},
		daysLeft() {
			if (!this.periodInfo?.ended_at) return 0
			const end = new Date(this.periodInfo.ended_at).getTime()
			const now = Date.now()
			const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
			return Math.max(0, diff)
		},
	},
}
</script>
