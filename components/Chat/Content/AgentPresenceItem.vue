<template>
	<div class="line-clamp-2">
		<span v-if="agent.agentAction === AgentActions.TYPING" class="text-muted text-xs">
			<i>{{ $t('components.chat.content.messageInput.typing', { name: agent.name }) }}</i>
		</span>
		<span v-if="agent.agentAction === AgentActions.WHISPERING" class="text-warning text-xs">
			<i>{{ agent.name }}: {{ agent.whisperText }}</i>
		</span>
		<span v-if="agent.agentAction === AgentActions.WATCHING" class="text-subtle text-xs">
			<i>{{ $t('components.chat.content.messageInput.watching', { name: agent.name }) }}</i>
		</span>
	</div>
</template>

<script>
import { AgentActions } from '~/composables/useAgentPresence.js'

export default {
	name: 'AgentPresenceItem',
	props: {
		agent: {
			type: Object,
			required: true,
		},
	},
	data() {
		return { AgentActions }
	},
}
</script>
