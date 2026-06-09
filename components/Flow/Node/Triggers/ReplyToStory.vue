<template>
	<div class="flex flex-col gap-6">
		<Filters :filterOptions="trigger.config" />
		<div class="divider my-0" />
		<CustomToggleSwitch
			v-model="trigger.config.likeReply"
			:title="$t('components.flow.node.triggers.replyToStory.autoLikeTitle')"
			:description="$t('components.flow.node.triggers.replyToStory.autoLikeDescription')"
			class="border border-muted rounded-xl shadow-xs"
			icon-class="fa fa-heart fa-lg text-red-500"
		/>
	</div>
</template>
<script>
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'
import Filters from '~/components/Flow/Node/Triggers/Partials/Filters.vue'

export default {
	components: { Filters, CustomToggleSwitch },
	props: {
		node: {
			type: Node,
			required: true,
		},
		trigger: {
			type: Trigger,
			default: null,
		},
	},
}
</script>

<style scoped></style>
