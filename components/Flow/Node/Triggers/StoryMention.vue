<template>
	<div class="flex flex-col gap-6">
		<CustomToggleSwitch
			v-model="trigger.config.autoLike"
			:title="$t('components.flow.node.triggers.storyMention.autoLikeTitle')"
			:description="$t('components.flow.node.triggers.storyMention.autoLikeDescription')"
			class="border border-muted rounded-xl shadow-xs"
			icon-class="fa fa-heart fa-lg text-red-500"
		/>

		<CustomToggleSwitch
			v-model="trigger.config.perContactADay"
			:title="$t('components.flow.node.triggers.storyMention.perContactTitle')"
			:description="$t('components.flow.node.triggers.storyMention.perContactDescription')"
			class="border border-muted rounded-xl shadow-xs"
			icon-class="fa fa-calendar-day fa-lg text-blue-500"
		/>
	</div>
</template>
<script>
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'

export default {
	components: { CustomToggleSwitch },
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
