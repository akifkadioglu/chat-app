/**
 * Laravel Echo (Reverb) presence provider.
 * Private channels + whisper for client-to-client presence & typing.
 *
 * Provider contract:
 *   setLocalUser(conversationId, userId, userInfo): void
 *   setPresence(conversationId, userId, data): void
 *   clearPresence(conversationId): void
 *   watchPresence(conversationId, callback): () => void
 */

import { useNuxtApp } from '#imports'

const channels = {}
const localState = {}
const heartbeats = {}
let authConfigured = false

const HEARTBEAT_INTERVAL = 5000
const STALE_TIMEOUT = 12000

function getEcho() {
	const { $echo, $requestAdapter } = useNuxtApp()
	if (!$echo) return null

	if (!authConfigured) {
		$echo.connector.pusher.config.channelAuthorizer = (params, callback) => {
			$requestAdapter
				.post('/broadcasting/auth', { socket_id: params.socketId, channel_name: params.channelName })
				.then((data) => callback(null, data))
				.catch((err) => callback(err, null))
		}
		authConfigured = true
	}

	return $echo
}

function getChannel(conversationId) {
	if (!channels[conversationId]) {
		const echo = getEcho()
		if (!echo) return null
		channels[conversationId] = echo.private(`conversation.${conversationId}`)
	}
	return channels[conversationId]
}

function leaveChannel(conversationId) {
	if (!channels[conversationId]) return
	const echo = getEcho()
	if (!echo) return
	stopHeartbeat(conversationId)
	echo.leave(`private-conversation.${conversationId}`)
	delete channels[conversationId]
	delete localState[conversationId]
}

function startHeartbeat(channel, conversationId) {
	stopHeartbeat(conversationId)
	heartbeats[conversationId] = setInterval(() => {
		broadcastState(channel, conversationId)
	}, HEARTBEAT_INTERVAL)
}

function stopHeartbeat(conversationId) {
	if (heartbeats[conversationId]) {
		clearInterval(heartbeats[conversationId])
		delete heartbeats[conversationId]
	}
}

function broadcastState(channel, conversationId) {
	const state = localState[conversationId]
	if (!state) return
	channel.whisper(state.agentAction ? 'typing' : 'watching', state)
}

export const echoPresenceProvider = {
	setLocalUser(conversationId, userId, userInfo) {
		if (!localState[conversationId]) {
			localState[conversationId] = { id: userId, ...userInfo, agentAction: null }
		}
	},

	setPresence(conversationId, userId, data) {
		const payload = { ...data, id: userId }
		localState[conversationId] = payload
		const channel = getChannel(conversationId)
		if (!channel) return
		channel.whisper('typing', payload)
	},

	clearPresence(conversationId) {
		const current = localState[conversationId]
		if (!current) return
		const watchPayload = { id: current.id, name: current.name, avatar: current.avatar, agentAction: null }
		localState[conversationId] = watchPayload
		const channel = getChannel(conversationId)
		if (channel) channel.whisper('watching', watchPayload)
	},

	watchPresence(conversationId, callback) {
		const channel = getChannel(conversationId)
		if (!channel) return () => {}

		const users = {}
		const lastSeen = {}

		const updateUser = (data) => {
			users[data.id] = data
			lastSeen[data.id] = Date.now()
			callback(Object.values(users))
		}
		const removeUser = (data) => {
			delete users[data.id]
			delete lastSeen[data.id]
			callback(Object.values(users))
		}

		const staleCheck = setInterval(() => {
			const now = Date.now()
			let changed = false
			Object.keys(lastSeen).forEach((id) => {
				if (now - lastSeen[id] > STALE_TIMEOUT) {
					delete users[id]
					delete lastSeen[id]
					changed = true
				}
			})
			if (changed) callback(Object.values(users))
		}, HEARTBEAT_INTERVAL)

		channel
			.listenForWhisper('typing', updateUser)
			.listenForWhisper('watching', updateUser)
			.listenForWhisper('presence-leave', removeUser)
			.listenForWhisper('presence-ping', () => broadcastState(channel, conversationId))

		channel.subscribed(() => {
			channel.whisper('presence-ping', {})
			startHeartbeat(channel, conversationId)
		})

		const pause = () => {
			const state = localState[conversationId]
			if (state) channel.whisper('presence-leave', { id: state.id })
			stopHeartbeat(conversationId)
		}
		const resume = () => {
			channel.whisper('presence-ping', {})
			startHeartbeat(channel, conversationId)
			broadcastState(channel, conversationId)
		}

		const onVisibilityChange = () => (document.hidden ? pause() : resume())
		const onBlur = () => pause()
		const onFocus = () => resume()

		document.addEventListener('visibilitychange', onVisibilityChange)
		window.addEventListener('blur', onBlur)
		window.addEventListener('focus', onFocus)

		const onBeforeUnload = () => {
			const state = localState[conversationId]
			if (state) channel.whisper('presence-leave', { id: state.id })
		}
		window.addEventListener('beforeunload', onBeforeUnload)

		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange)
			window.removeEventListener('blur', onBlur)
			window.removeEventListener('focus', onFocus)
			window.removeEventListener('beforeunload', onBeforeUnload)
			clearInterval(staleCheck)
			const state = localState[conversationId]
			if (state) channel.whisper('presence-leave', { id: state.id })
			leaveChannel(conversationId)
			callback([])
		}
	},
}
