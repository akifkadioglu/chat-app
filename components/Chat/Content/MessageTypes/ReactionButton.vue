<template>
	<button class="btn btn-circle btn-sm btn-ghost text-lg">
		<Reaction :icon="icon" />
	</button>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Reaction from '~/components/Chat/Content/MessageTypes/Reaction.vue'
import { REACTION } from '~/models/Conversation/Message'

export default defineComponent({
	name: 'ReactionButton',
	components: { Reaction },
	props: {
		icon: {
			type: String as () => REACTION,
			required: true,
		},
	},
	data() {
		return {
			REACTION,
		}
	},
})
</script>
