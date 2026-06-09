<template>
	<div v-if="chatAccountsStore.count">
		<AccountProfile
			v-if="activeAccount"
			:is-loading="false"
			:username="activeAccount.postAccount.username"
			:ring-color="activeAccount.ringColor"
			ring="ring-2"
			:profile-picture="activeAccount.postAccount.profilePicture"
			:size="24"
		/>
	</div>
</template>
<script>
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'

export default {
	name: 'SelectedAccount',
	components: { AccountProfile },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		activeAccount() {
			return this.chatAccountsStore.active
		},
	},
}
</script>
