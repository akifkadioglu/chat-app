<template>
	<CustomDropdown
		:class="[
			'overflow-hidden flex items-center transition-all duration-200 ease-in-out',
			dropdownOpen ? 'w-5' : 'w-0 group-hover:w-5',
		]"
		@show="dropdownOpen = true"
		@hide="dropdownOpen = false"
		placement="bottom-start"
		:skidding="-5"
		ref="dropdown"
	>
		<button @click.stop.prevent>
			<span>
				<i class="fa fa-chevron-down" />
			</span>
		</button>
		<template #popper>
			<ul class="menu">
				<li v-if="isConversationPinned">
					<a @click="removeConversationFromPinned">
						<i class="fa fa-thumbtack mr-2"></i> {{ $t('components.chat.sidebar.itemOptions.removePinned') }}
					</a>
				</li>
				<li v-else>
					<!--					:class="{ 'pointer-events-none opacity-50': isPinnedLimitReached }"-->
					<a @click="addConversationToPinned">
						<i class="fa fa-thumbtack mr-2" /> {{ $t('components.chat.sidebar.itemOptions.pin') }}
					</a>
				</li>
				<li>
					<a @click="unread">
						<i class="fa fa-envelope mr-2" /> {{ $t('components.chat.sidebar.itemOptions.markAsUnread') }}
					</a>
				</li>
				<li>
					<a @click="askDeleteConversation">
						<i class="fa fa-trash mr-2" /> {{ $t('components.chat.sidebar.itemOptions.deleteConversation') }}
					</a>
				</li>
				<li v-if="teamUsers.length > 0">
					<TeamUsersDropdown
						:skidding="-3"
						placement="right-start"
						:placeholder="$t('components.chat.sidebar.itemOptions.assignee')"
						:selectedAssignedUserId="selectedAssignedUserId"
						triggerClass="w-full flex items-center"
						class="w-full flex"
						onlyPlaceholder
						@change="onAssigneeChange"
					>
						<template #triggerIcon>
							<LoadingElement :isLoading="isAssigneeLoading">
								<i class="fa fa-user mr-3" />
							</LoadingElement>
						</template>
					</TeamUsersDropdown>
				</li>
			</ul>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import apiList from '~/apis/ApiList.js'
import TeamUsersDropdown from '~/components/Chat/Sidebar/TeamUsersDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

const MAX_PINNED_CONVERSATIONS_COUNT = 5
export default {
	components: { LoadingElement, TeamUsersDropdown, CustomDropdown },
	props: {
		conversationId: {
			type: Number,
		},
		chatAccountId: {
			type: Number,
		},
	},
	setup() {
		return {
			conversationMessagesStore: useConversationMessagesStore(),
			conversationsStore: useConversationsStore(),
			localeRoute: useLocaleRoute(),
			teamStore: useTeamStore(),
		}
	},
	data() {
		return {
			dropdownOpen: false,
			isAssigneeLoading: false,
		}
	},
	computed: {
		isConversationPinned() {
			return this.conversationsStore.isConversationPinned(this.conversationId.toString())
		},
		selectedAssignedUserId() {
			return this.conversationsStore.getConversationAssignedUserId(this.conversationId.toString())
		},
		// isPinnedLimitReached() {
		// 	return this.conversationsStore.pinnedConversationIds.length >= MAX_PINNED_CONVERSATIONS_COUNT
		// },
		teamUsers() {
			return this.teamStore.team?.teamUsers || []
		},
	},
	methods: {
		onAssigneeChange(userId) {
			this.isAssigneeLoading = true
			const oldAssignedUserId = this.conversationsStore.getConversationAssignedUserId(this.conversationId.toString())
			this.conversationsStore.updateConversationAssignedUserId(this.conversationId.toString(), userId)
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.changeAssignee,
					{
						assigneeUserId: userId,
					},
					{
						conversationId: this.conversationId,
						chatAccountId: this.chatAccountId,
					},
				)
				.then((response) => {
					this.$refs.dropdown.hide()
				})
				.catch((err) => {
					this.conversationsStore.updateConversationAssignedUserId(this.conversationId.toString(), oldAssignedUserId)
				})
				.finally(() => {
					this.isAssigneeLoading = false
				})
		},
		unread() {
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.unread,
					{},
					{
						conversationId: this.conversationId,
						chatAccountId: this.chatAccountId,
					},
				)
				.then((res) => {
					const slice = this.conversationMessagesStore.getMessageSlice(this.conversationId)
					res.data.forEach((messageId) => {
						const msg = slice.messages.find((m) => m.id.toString() === messageId.toString())
						if (msg) {
							msg.readAt = null
						}
					})
				})

			this.$refs.dropdown.hide()
		},
		askDeleteConversation() {
			this.$refs.dropdown.hide()
			this.$swal
				.fire({
					title: this.$t('components.chat.sidebar.itemOptions.deleteAlert.title'),
					text: this.$t('components.chat.sidebar.itemOptions.deleteAlert.text'),
					icon: 'warning',
					showCancelButton: true,
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.chat.sidebar.itemOptions.deleteAlert.confirm'),
					cancelButtonText: this.$t('components.chat.sidebar.itemOptions.deleteAlert.cancel'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.deleteConversation()
					}
				})
		},
		deleteConversation() {
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.delete,
					{},
					{
						conversationId: this.conversationId,
						chatAccountId: this.chatAccountId,
					},
				)
				.then(() => {
					this.conversationsStore.deleteConversation(this.conversationId)
					const { c, ...query } = this.$route.query
					this.removeConversationFromPinned()

					this.$router.replace(this.localeRoute({ name: 'chat', query: query }))
				})
		},
		addConversationToPinned() {
			this.conversationsStore.pinConversation(this.conversationId.toString())
			this.$refs.dropdown.hide()
		},
		removeConversationFromPinned() {
			this.conversationsStore.unpinConversation(this.conversationId.toString())
			this.$refs.dropdown.hide()
		},
	},
}
</script>
