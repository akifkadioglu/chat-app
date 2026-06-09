<template>
	<div>
		<OverviewTab :key="selectedAccount.uuid" />
	</div>
</template>
<script>
import tab from '~/pages/account/[tab].vue'
import OverviewTab from '~/components/Accounts/OverviewTab.vue'

export default {
	components: {
		OverviewTab,
		tab,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		selectedAccount() {
			return this.chatAccountsStore.active
		},
	},
}
</script>

<style scoped></style>
