<template>
	<div
		class="flex"
		:class="{
			'justify-end': !inbound,
			'justify-start': inbound,
		}"
	>
		<div
			class="inline-block min-w-0 rounded-xl px-3 py-2 wrap-break-word text-wrap text-white max-w-[90%]"
			:class="[
				bubbleClasses,
				{
					'rounded-tl-none': compactMessageForSameDirection && inbound,
					'rounded-tr-none': compactMessageForSameDirection && !inbound,
				},
				customBubbleClasses,
			]"
		>
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	props: {
		inbound: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			default: 'text',
		},
		compactMessageForSameDirection: {
			type: Boolean,
			default: false,
		},
		isOnlyEmoji: {
			type: Boolean,
			default: false,
		},
		customBubbleClasses: {
			type: String,
			default: '',
		},
	},
	computed: {
		shouldApplyTextBubble() {
			return ['text', 'dynamic', 'audio', 'file'].includes(this.type || '')
		},
		bubbleClasses() {
			if (!this.shouldApplyTextBubble) return ''
			return {
				'rounded-br-none bg-indigo-700': !this.inbound && !this.isOnlyEmoji,
				'rounded-bl-none bg-zinc-800': this.inbound && !this.isOnlyEmoji,

				'text-4xl': this.isOnlyEmoji,
			}
		},
	},
}
</script>
