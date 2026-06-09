<template>
	<li class="w-full group" v-if="conversation?.contact">
		<LocalizedLink
			name="chat"
			:query="{ c: conversation.contact?.id }"
			class="flex flex-col items-start w-full"
			:class="[
				{ 'menu-active': activeConversation && activeConversation.id === conversation?.id },
				`border-account ${conversation.chatAccount?.borderAccountColor}`,
			]"
			@click="conversationSelected"
		>
			<span class="flex w-full items-start">
				<span class="flex truncate gap-2 w-full items-center">
					<span class="relative ps-1">
						<div :class="`ring-2 ${conversation.chatAccount.ringColor} ring-opacity-60`" class="rounded-full">
							<ProfilePicture
								:alt="conversation.contact?.name"
								:src="conversation.contact?.platformAccountsInstagram?.profileImageUrl"
							/>
						</div>
					</span>

					<span class="flex-1 truncate">
						<span class="text-sm truncate">
							{{ conversation.contact?.name.trim().length > 0 ? conversation.contact?.name : '&nbsp;' }}
						</span>

						<span :class="unreadCount > 0 ? '' : 'opacity-75'" class="text-xs truncate block font-username">
							{{ conversation.contact.platformAccountsInstagram?.username ?? '&nbsp;' }}&nbsp;
						</span>

						<span class="text-xs opacity-75">
							{{
								$t('components.chat.sidebar.conversationList.followersText', {
									followersCount: $formatSocialCount(conversation.contact.platformAccountsInstagram?.followersCount),
								})
							}}
						</span>
					</span>

					<span v-if="unreadCount > 0" class="badge bg-simpliers text-white badge-sm w-7 h-7 rounded-full border-0">
						{{ unreadCount > 99 ? '99+' : unreadCount }}
					</span>
				</span>
				<ItemOptions :conversationId="conversation.id" :chatAccountId="conversation.chatAccountId" />
			</span>

			<span class="flex w-full items-center justify-between">
				<span v-if="lastMessage" :class="unreadCount > 0 ? '' : 'opacity-50'" class="text-xs sm:text-sm italic">
					<span class="line-clamp-2 break-all">
						<span class="text-xs" v-if="lastMessage.content.isUnsupported">
							{{ $t('components.chat.sidebar.conversationList.unsupportedMessage') }}
						</span>
						{{ lastMessage.messagePreviewText }}
					</span>
				</span>
				<span>
					<span
						v-if="teamStore.team?.id && conversation.assignedUserId"
						class="badge badge-sm max-w-24 inline-block truncate shrink-0"
						:class="getBadgeSoftColor(conversation.assignedUserId)"
					>
						{{ conversation.assignedUser.name }}
					</span>

					<span v-if="isConversationPinned">
						<i class="fa-solid fa-thumbtack" />
					</span>
				</span>
			</span>
		</LocalizedLink>
	</li>
</template>

<script>
import { useConversationMessagesStore } from '~/stores/conversationMessages.ts'
import { useConversationsStore } from '~/stores/conversations.ts'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import { Conversation } from '~/models/Conversation/Conversation.js'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import ItemOptions from '~/components/Chat/Sidebar/ItemOptions.vue'
import { getBadgeSoftColor } from '~/types/colors.ts'

export default {
	components: {
		ItemOptions,
		LocalizedLink,
		ProfilePicture,
	},
	props: {
		conversation: {
			type: Conversation,
			required: true,
		},
	},
	setup() {
		return {
			conversationMessagesStore: useConversationMessagesStore(),
			conversationsStore: useConversationsStore(),
			contactsStore: useContactsStore(),
			teamStore: useTeamStore(),
		}
	},
	computed: {
		activeConversation() {
			return this.conversationsStore.activeConversation
		},
		lastMessage() {
			return this.conversationMessagesStore.getLastMessageForConversation(this.conversation.id)
		},
		unreadCount() {
			return this.conversationMessagesStore.getUnreadCountForConversation(this.conversation.id)
		},
		isConversationPinned() {
			return this.conversationsStore.isConversationPinned(this.conversation.id.toString())
		},
	},
	methods: {
		getBadgeSoftColor,
		conversationSelected() {
			this.$emit('conversationSelected')
		},
	},
}
</script>
