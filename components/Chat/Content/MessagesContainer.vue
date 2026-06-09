<template>
	<transition-group name="fade" tag="div" class="pt-5">
		<div
			v-for="(message, index) in messages"
			:key="message.uuid"
			:class="['flex group', message.direction === DIRECTION.OUTBOUND ? 'justify-end' : 'justify-start']"
		>
			<ChatMessage
				:show-translated-messages="showTranslatedMessages"
				:showSkeleton="showSkeleton"
				:message="message"
				:previousDirection="messages[index - 1]?.direction"
				:contact="contact"
				:next-direction="messages[index + 1]?.direction"
				:next-user-id="messages[index + 1]?.userId"
			/>
		</div>
	</transition-group>
</template>
<script lang="ts">
import ChatMessage from '~/components/Chat/Content/ChatMessage.vue'
import ReactionButton from '~/components/Chat/Content/MessageTypes/ReactionButton.vue'
import InfiniteLoading from 'v3-infinite-loading'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { DIRECTION, Message } from '~/models/Conversation/Message'
import { Contact } from '~/models/Contact/Contact'

export default {
	props: {
		showTranslatedMessages: {
			type: Boolean,
			default: false,
		},
		showSkeleton: {
			type: Boolean,
			default: false,
		},
		messages: {
			type: Array as () => Message[],
			required: true,
		},
		contact: {
			type: Contact,
			default: null,
		},
	},
	data() {
		return {
			DIRECTION,
		}
	},
	components: { LoadingElement, ReactionButton, ChatMessage, InfiniteLoading },
	setup() {
		return {}
	},
}
</script>
