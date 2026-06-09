<template>
	<ChatSvgLogo2 v-if="isShort" class="inline" aria-hidden="true" :from="from" :to="to" />
	<ChatSvgLogo v-else class="inline" aria-hidden="true" :from="from" :to="to" />
</template>

<script>
import ChatSvgLogo from '~/components/GlobalComponents/Brands/ChatSvgLogo.vue'
import ChatSvgLogo2 from '~/components/GlobalComponents/Brands/ChatSvgLogo2.vue'

export default {
	components: { ChatSvgLogo2, ChatSvgLogo },
	props: {
		isShort: {
			type: Boolean,
			default: false,
		},
		from: {
			type: String,
			default: '#f40033',
		},
		to: {
			type: String,
			default: '#452fd4',
		},
	},
}
</script>
