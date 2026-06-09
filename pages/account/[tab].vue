<template>
	<div :key="chatAccount.uuid">
		<OverviewTab v-if="!tab" />
		<SettingsTab v-if="tab === TABS.settings.key" />
		<AttributesTab v-if="tab === TABS.attributes.key" />
		<PlanBillingTab v-if="tab === TABS.billing.key" />
		<ActivitiesTab v-if="tab === TABS.activities.key" />
		<!--		<MessengerProfileTab v-if="tab === TABS.messengerProfiles.key" />-->
	</div>
</template>
<script>
import AttributesTab from '~/components/Accounts/AttributesTab.vue'
import { TABS } from '~/models/ChatAccount.ts'
import PlanBillingTab from '~/components/Accounts/BillingTab/PlanBillingTab.vue'
import SettingsTab from '~/components/Accounts/SettingsTab.vue'
import OverviewTab from '~/components/Accounts/OverviewTab.vue'
import ActivitiesTab from '~/components/Accounts/ActivitiesTab.vue'

export default {
	components: { OverviewTab, SettingsTab, PlanBillingTab, AttributesTab, ActivitiesTab },
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
	},
	computed: {
		tab() {
			return this.$route.params.tab
		},
		chatAccount() {
			const chatAccountsStore = useChatAccountsStore()
			return chatAccountsStore.active
		},
	},
	data() {
		return {
			TABS,
		}
	},
}
</script>

<style scoped></style>
