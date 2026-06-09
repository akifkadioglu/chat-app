<template>
	<div class="space-y-4">
		<PersistentMenuCard :chat-account="activeChatAccount" />

		<IceBreakerMenuCard :chat-account="activeChatAccount" />
	</div>
</template>
<script>
import { useChatAccountsStore } from '~/stores/chatAccounts.ts'
import PersistentMenuCard from '~/components/Accounts/SettingsTab/MessengerProfiles/PersistentMenuCard.vue'
import IceBreakerMenuCard from '~/components/Accounts/SettingsTab/MessengerProfiles/IceBreakerMenuCard.vue'

export default {
	name: 'MessengerProfileTab',
	components: { IceBreakerMenuCard, PersistentMenuCard },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		activeChatAccount() {
			return this.chatAccountsStore?.active
		},
	},
}
</script>

<style scoped></style>
