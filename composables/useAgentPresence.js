import { onUnmounted, ref } from 'vue'
import { echoPresenceProvider as provider } from '~/helpers/typingProviders/echoPresenceProvider.js'

export const AgentActions = {
	WHISPERING: 1,
	TYPING: 2,
	WATCHING: 3,
}

export function useAgentPresence() {
	let unsubscribe = null
	const presenceUsers = ref([])

	function updatePresence({ conversationId, user, text = '', whisperText = '', agentAction = null }) {
		if (!conversationId || !user?.id) return

		provider.setLocalUser(conversationId, user.id, {
			name: user.name || user.email || user.id,
			avatar: user.avatar || null,
		})

		provider.setPresence(conversationId, user.id, {
			id: user.id,
			name: user.name || user.email || user.id,
			avatar: user.avatar || null,
			text,
			whisperText,
			agentAction,
			startedAt: Date.now(),
		})
		// provider.registerDisconnect(conversationId, user.id)
	}

	function clearPresence({ conversationId, user }) {
		if (!conversationId || !user?.id) return
		provider.clearPresence(conversationId, user.id)
	}

	function listenPresence(conversationId, currentUserId) {
		_stopListening()
		if (!conversationId) return

		unsubscribe = provider.watchPresence(conversationId, (users) => {
			presenceUsers.value = users.filter((u) => u.id !== currentUserId)
		})
	}

	function _stopListening() {
		unsubscribe?.()
		unsubscribe = null
		presenceUsers.value = []
	}

	onUnmounted(_stopListening)

	return { updatePresence, clearPresence, listenPresence, presenceUsers }
}
