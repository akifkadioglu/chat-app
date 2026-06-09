<template>
	<div class="flex items-center gap-2 relative">
		<i class="fa-solid fa-bullhorn absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
		<input
			:value="modelValue"
			type="text"
			class="flex-1 bg-transparent input input-xs pl-8"
			:placeholder="$t('components.chat.content.messageInput.whisperPlaceholder')"
			@focus="$emit('whisperFocus')"
			@input="$emit('update:modelValue', $event.target.value), $emit('whisperInput')"
			@blur="$emit('whisperBlur')"
			maxlength="50"
		/>
	</div>
</template>

<script>
export default {
	name: 'AgentWhisperInput',
	props: {
		modelValue: {
			type: String,
			default: '',
		},
	},
	emits: ['update:modelValue', 'whisperInput', 'whisperBlur', 'whisperFocus'],
}
</script>
