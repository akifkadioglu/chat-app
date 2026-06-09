<template>
	<div class="bs container">
		<div class="flex flex-col lg:flex-row mb-10">
			<ChatAccountTags :account="activeChatAccount" />

			<div class="divider lg:divider-horizontal" />

			<ChatAccountCustomFields :account="activeChatAccount" />
		</div>
	</div>
</template>

<script>
import ChatAccountCustomFields from '~/components/Accounts/AttributesTab/ChatAccountCustomFields.vue'
import ChatAccountTags from '~/components/Accounts/AttributesTab/ChatAccountTags.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts.ts'
export default {
	components: { ChatAccountTags, ChatAccountCustomFields },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		activeChatAccount() {
			return this.chatAccountsStore.active
		},
	},
}
</script>
