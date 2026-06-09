<template>
	<div>
		<div
			v-if="chatAccount.needsUpgrade"
			class="p-3 bg-info/10 rounded-lg text-sm flex items-center justify-between gap-2"
		>
			<p class="text-muted line-clamp-2">
				{{ $t('components.chat.content.messageInputRestriction.contactLimit.description') }}
			</p>
			<button
				class="btn btn-sm btn-soft btn-info btn-transition"
				@click="$emitter.emit('showUpgradeModal', { chatAccount: chatAccount, feature: 'upgrade' })"
			>
				<i class="fa fa-arrow-up mr-2" />
				{{ $t('components.chat.content.messageInputRestriction.contactLimit.upgradeButton') }}
			</button>
		</div>
		<div
			v-else-if="!chatAccount.isStatusActive"
			class="p-3 bg-error/10 rounded-lg text-sm flex items-center justify-between gap-2"
		>
			<p class="text-muted line-clamp-2">
				{{ $t('components.chat.content.messageInputRestriction.permissionsExpired.description') }}
			</p>
			<RefreshPermissionButton
				class="btn btn-sm btn-error btn-soft btn-transition"
				titleClass=""
				:title="$t('components.chat.content.messageInputRestriction.permissionsExpired.refreshButton')"
			/>
		</div>
		<div
			v-else-if="chatAccount.statusReasonCode === STATUS_REASON_CODE.DM_ACCESS_DISABLED"
			class="p-3 bg-error/10 rounded-lg text-sm flex items-center justify-between gap-2"
		>
			<p class="text-muted line-clamp-2">
				{{ $t('components.chat.content.messageInputRestriction.dmAccessDisabled.description') }}
			</p>
			<div class="flex flex-col items-end shrink-0">
				<button class="btn btn-sm btn-error btn-soft btn-transition w-fit" @click="openDmAccessGuide">
					<i class="fa fa-circle-question mr-2" />
					{{ $t('components.chat.content.messageInputRestriction.dmAccessDisabled.button') }}
				</button>
				<button class="btn btn-sm btn-link btn-error btn-transition" :disabled="resetting" @click="resetStatusReason">
					<span v-if="resetting" class="loading loading-spinner loading-xs" />
					{{ $t('components.chat.content.messageInputRestriction.dmAccessDisabled.resetButton') }}
				</button>
			</div>
		</div>
		<div v-else-if="!contact?.isAnswerable">
			<i class="fa fa-info-circle mr-1 text-info-content" />
			{{ $t('components.chat.content.messageInput.cannotSendMessage') }}
		</div>
	</div>
</template>
<script>
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'
import { ChatAccount, STATUS_REASON_CODE } from '~/models/ChatAccount.ts'
import { Contact } from '~/models/Contact/Contact.ts'
import apiList from '~/apis/ApiList.js'

export default {
	components: { RefreshPermissionButton },
	props: {
		chatAccount: {
			type: ChatAccount,
			required: true,
		},
		contact: {
			type: Contact,
			required: true,
		},
	},
	data() {
		return {
			resetting: false,
		}
	},
	computed: {
		STATUS_REASON_CODE() {
			return STATUS_REASON_CODE
		},
	},
	methods: {
		openDmAccessGuide() {
			this.$emitter.emit('showDmAccessDisabledModal')
		},
		resetStatusReason() {
			this.resetting = true
			this.$requestAdapter
				.post(apiList.chat.instagram.chatAccountId.resetStatusReason, null, {
					chatAccountId: this.chatAccount.id,
				})
				.then((response) => {
					this.chatAccount.statusReasonCode = STATUS_REASON_CODE.ACTIVE
				})
				.finally(() => {
					this.resetting = false
				})
		},
	},
}
</script>

<style scoped></style>
