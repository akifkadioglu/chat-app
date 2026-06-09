<template>
	<div v-if="activeAccount" v-auto-animate class="bg-base-100 relative">
		<TopBar
			v-if="activeAccount.overageLimitFilled"
			class="bg-error/10 text-error cursor-pointer"
			iconClass="fa fa-circle-pause text-sm mr-1"
			:title="$t('components.baseComponents.accountStatusBanner.overageLimitFilled.title')"
			:description="$t('components.baseComponents.accountStatusBanner.overageLimitFilled.description')"
			@click="showMaxOverageLimitModal"
		>
			<template #button>
				<div class="flex flex-col items-center gap-1">
					<button class="btn btn-error btn-sm" @click.stop="showMaxOverageLimitModal">
						<i class="fa fa-sliders" />
						{{ $t('components.baseComponents.accountStatusBanner.overageLimitFilled.adjustButton') }}
					</button>
					<button class="link link-error text-xs" @click.stop="showUpgradeModal">
						<i class="fa fa-bolt" />
						{{ $t('components.baseComponents.accountStatusBanner.reachedContactLimit.upgradeButton') }}
					</button>
				</div>
			</template>
		</TopBar>
		<TopBar
			v-else-if="activeAccount.needsUpgrade"
			class="bg-warning-content text-warning cursor-pointer"
			iconClass="fa fa-user-friends text-sm mr-1"
			:title="$t('components.baseComponents.accountStatusBanner.needsUpgrade.title')"
			:description="$t('components.baseComponents.accountStatusBanner.needsUpgrade.description')"
			descriptionClass="dark:text-base-100!"
			@click="showUpgradeModal"
		>
			<template #button>
				<!--
				{{									:symbolOnLeft="plan.price?.execCurrency.symbolOnLeft"
          :symbol="plan.price?.execCurrency.symbol"
          :execPrice="price"
				}}
-->
				<button class="btn btn-primary btn-sm" @click="showUpgradeModal">
					<i class="fa fa-certificate" />
					{{ $t('components.baseComponents.accountStatusBanner.needsUpgrade.upgradeButton') }}
				</button>
			</template>
		</TopBar>
		<TopBar
			v-else-if="activeAccount.reachedContactLimit"
			class="bg-primary/10 text-primary cursor-pointer"
			iconClass="fa fa-arrow-trend-up text-sm mr-1"
			:title="$t('components.baseComponents.accountStatusBanner.reachedContactLimit.title')"
			@click="showMaxOverageLimitModal"
		>
			<template #description>
				<i18n-t keypath="components.baseComponents.accountStatusBanner.reachedContactLimit.description" tag="span">
					<template #extraPrice>
						<span v-if="price?.exec_currency?.symbol_on_left">{{ price?.exec_currency?.symbol }}</span
						>{{ $formatPrice(price?.extra_contact_price, $i18n.locale, price?.exec_currency?.code)
						}}<span v-if="!price?.exec_currency?.symbol_on_left"> {{ price?.exec_currency?.symbol }}</span>
					</template>
				</i18n-t>
			</template>

			<template #button>
				<div class="flex flex-col items-center gap-1">
					<button class="btn btn-primary btn-sm" @click.stop="showMaxOverageLimitModal">
						<i class="fa fa-sliders" />
						{{ $t('components.baseComponents.accountStatusBanner.reachedContactLimit.adjustButton') }}
					</button>
					<button class="link link-primary text-xs" @click.stop="showUpgradeModal">
						<i class="fa fa-bolt" />
						{{ $t('components.baseComponents.accountStatusBanner.reachedContactLimit.upgradeButton') }}
					</button>
				</div>
			</template>
		</TopBar>
		<TopBar
			v-else-if="!activeAccount.isStatusActive"
			iconClass="fa fa-exclamation-circle"
			class="bg-error/10 text-error cursor-pointer"
			:title="$t('components.baseComponents.accountStatusBanner.permissionsExpired.title')"
			:description="$t('components.baseComponents.accountStatusBanner.permissionsExpired.description')"
		>
			<template #button>
				<RefreshPermissionButton class="btn-sm" titleClass="mx-auto" />
			</template>
		</TopBar>
		<TopBar
			v-else-if="activeAccount.statusReasonCode === STATUS_REASON_CODE.DM_ACCESS_DISABLED"
			class="bg-error/10 text-error cursor-pointer"
			iconClass="fa fa-comment-slash text-sm mr-1"
			:title="$t('components.baseComponents.accountStatusBanner.dmAccessDisabled.title')"
			:description="$t('components.baseComponents.accountStatusBanner.dmAccessDisabled.description')"
			@click="openDmAccessGuide"
		>
			<template #button>
				<button class="btn btn-error btn-sm" @click.stop="openDmAccessGuide">
					<i class="fa fa-circle-question" />
					{{ $t('components.baseComponents.accountStatusBanner.dmAccessDisabled.button') }}
				</button>
			</template>
		</TopBar>
	</div>
</template>
<script>
import TopBar from '~/components/Flow/TopBar.vue'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'
import DevTestScenario from '~/components/GlobalComponents/DevTestScenario.vue'
import { ChatAccount, STATUS_REASON_CODE } from '~/models/ChatAccount.ts'

export default {
	components: { DevTestScenario, RefreshPermissionButton, TopBar },
	props: {
		activeAccount: {
			type: ChatAccount,
			default: null,
		},
	},
	computed: {
		STATUS_REASON_CODE() {
			return STATUS_REASON_CODE
		},
		price() {
			return this.activeAccount?.subscription?.plan?.price
		},
	},
	methods: {
		showUpgradeModal() {
			this.$emitter.emit('showUpgradeModal', { chatAccount: this.activeAccount, feature: 'upgrade' })
		},
		showMaxOverageLimitModal() {
			this.$emitter.emit('showMaxOverageLimitModal')
		},
		openDmAccessGuide() {
			this.$emitter.emit('showDmAccessDisabledModal')
		},
	},
}
</script>

<style scoped></style>
