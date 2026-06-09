<template>
	<span v-if="icon === REACTION.LOVE || emoji === '❤'">❤️</span>
	<span v-else-if="icon === REACTION.LIKE">👍</span>
	<span v-else-if="icon === REACTION.ANGRY">😡</span>
	<span v-else-if="icon === REACTION.SAD">😢</span>
	<span v-else-if="icon === REACTION.WOW">😮</span>
	<span v-else-if="icon === REACTION.LAUGH">😂</span>
	<span v-else>
		{{ emoji }}
	</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { REACTION } from '~/models/Conversation/Message'

export default defineComponent({
	name: 'Reaction',
	props: {
		icon: {
			type: String as () => REACTION,
			required: true,
		},
		emoji: {
			type: String,
		},
	},
	data() {
		return {
			REACTION,
		}
	},
})
</script>
