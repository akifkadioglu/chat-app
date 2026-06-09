<template>
	<div class="flex flex-col gap-6">
		<CustomToggleSwitch
			v-model="trigger.config.perContactAVideo"
			:title="$t('components.flow.node.triggers.commentOnLive.perContactTitle')"
			:description="$t('components.flow.node.triggers.commentOnLive.perContactDescription')"
			class="border border-muted rounded-xl shadow-xs"
			icon-class="fa fa-video fa-lg text-red-500"
		/>

		<!--		<PrivateReply-->
		<!--			:privateReplyMessage="trigger.config.privateReplyMessage"-->
		<!--			:toEdges="node.toEdges"-->
		<!--			@addActionToButton="addActionToButton"-->
		<!--			@addEdgeToButton="addEdgeToButton"-->
		<!--		/>-->
	</div>
</template>
<script>
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'

export default {
	components: {
		CustomToggleSwitch,
	},
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
