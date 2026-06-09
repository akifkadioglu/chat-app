<template>
	<component
		:is="agentComponent"
		@open="opened = true"
		@close="opened = false"
		showArrow
		reverseArrow
		contentClass="px-4 flex-wrap"
		titleClass="py-0 mt-auto after:-translate-y-2"
	>
		<template #title>
			<div class="text-xs">
				<i v-if="!!firstWhisperingUser && !opened" class="text-warning">
					{{ firstWhisperingUser.name }}: {{ firstWhisperingUser.whisperText }}
				</i>
				<i v-else>
					{{
						$t('components.chat.content.messageInput.agentActivity', {
							count: presenceUsers.length - 1,
							names: presenceUsers
								.slice(0, 1)
								.map((user) => user.name)
								.join(', '),
						})
					}}
				</i>
			</div>
		</template>
		<div class="flex items-end-safe">
			<div class="px-4 flex-1 w-full max-h-30 overflow-y-auto mb-1">
				<AgentPresenceItem v-for="agent in presenceUsers" :key="agent.id" :agent="agent" />
			</div>
			<div
				class="px-4 py-1 flex-1 transition-all duration-300"
				:class="{ 'max-w-50': !inputFocused, 'max-w-3/4': inputFocused }"
			>
				<AgentWhisperInput
					:modelValue="whisperMessage"
					@update:modelValue="$emit('update:whisperMessage', $event)"
					@whisperFocus="inputFocused = true"
					@whisperInput="$emit('whisperInput')"
					@whisperBlur="$emit('whisperBlur'), (inputFocused = false)"
				/>
			</div>
		</div>
	</component>
</template>

<script>
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import AgentPresenceItem from '~/components/Chat/Content/AgentPresenceItem.vue'
import AgentWhisperInput from '~/components/Chat/Content/AgentWhisperInput.vue'
import { AgentActions } from '~/composables/useAgentPresence.js'

export default {
	name: 'AgentPresenceBar',
	components: { Collapse, AgentPresenceItem, AgentWhisperInput },
	props: {
		presenceUsers: {
			type: Array,
			required: true,
		},
		whisperMessage: {
			type: String,
			default: '',
		},
	},
	watch: {
		whisperMessage(newVal) {
			if (newVal === '') {
				this.$emit('whisperClear')
			}
		},
	},
	computed: {
		agentComponent() {
			return this.presenceUsers.length === 1 ? 'div' : 'Collapse'
		},
		firstWhisperingUser() {
			return this.presenceUsers.findLast((user) => user.agentAction === AgentActions.WHISPERING)
		},
	},
	data() {
		return {
			AgentActions,
			inputFocused: false,
			opened: false,
		}
	},
	emits: ['update:whisperMessage', 'whisperInput', 'whisperBlur', 'whisperClear'],
}
</script>
