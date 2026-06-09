<template>
	<div v-if="chatAccount?.postAccount" class="flex items-center gap-2 min-w-0">
		<img
			v-if="chatAccount.postAccount.profilePicture"
			v-img-error
			:src="chatAccount.postAccount.profilePicture"
			:alt="chatAccount.postAccount.username || ''"
			class="size-10 rounded-full object-cover"
		/>
		<div class="flex flex-col">
			<span class="truncate text-sm">{{ chatAccount.postAccount.name }}</span>
			<span class="truncate text-xs text-muted">@{{ chatAccount.postAccount.username }}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'CancelSubscriptionModalChatAccountChip',
	props: {
		chatAccount: {
			type: Object,
			default: null,
		},
	},
}
</script>
