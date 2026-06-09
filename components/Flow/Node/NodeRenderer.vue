<template>
	<Triggers v-if="node.type.key === nodeTypes.trigger.key" :node="node" />
	<AddTag v-else-if="node.type.key === nodeTypes.actions.addTag.key" :node="node" />
	<RemoveTag v-else-if="node.type.key === nodeTypes.actions.removeTag.key" :node="node" />
	<Delay v-else-if="node.type.key === nodeTypes.actions.delay.key" :node="node" />
	<ExternalRequest :node="node" v-else-if="node.type.key === nodeTypes.actions.externalRequest.key" />
	<SendMessage :node="node" v-else-if="node.type.key === nodeTypes.actions.sendMessage.key" :isMainNode="isMainNode" />
	<DataCollection
		:node="node"
		v-else-if="node.type.key === nodeTypes.actions.dataCollection.key"
		:isMainNode="isMainNode"
	/>
	<Comparison v-else-if="node.type.key === nodeTypes.conditions.comparison.key" :node="node" :isMainNode="isMainNode" />
	<TriggerFlow :node="node" v-else-if="node.type.key === nodeTypes.actions.triggerFlow.key" />
	<SetContactField :node="node" v-else-if="node.type.key === nodeTypes.actions.setContactField.key" />
	<Randomizer :node="node" v-else-if="node.type.key === nodeTypes.actions.randomizer.key" />
	<SendPrivateReply :node="node" v-else-if="node.type.key === nodeTypes.commentActions.sendPrivateReply.key" />
	<ReplyComment :node="node" v-else-if="node.type.key === nodeTypes.commentActions.replyComment.key" />
	<HideComment :node="node" v-else-if="node.type.key === nodeTypes.commentActions.hideComment.key" />
	<PauseFlows :node="node" v-else-if="node.type.key === nodeTypes.actions.pauseFlows.key" />

	<Signature :node="node" v-else-if="node.type.key === nodeTypes.signature.key" :isMainNode="isMainNode" />
</template>
<script>
import { nodeTypes } from '~/models/Flow/utils/utils.js'
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import Comparison from '~/components/Flow/Node/Conditions/Comparison.vue'
import TriggerFlow from '~/components/Flow/Node/Actions/TriggerFlow.vue'
import ExternalRequest from '~/components/Flow/Node/Actions/ExternalRequest.vue'
import SendMessage from '~/components/Flow/Node/Actions/SendMessage.vue'
import Delay from '~/components/Flow/Node/Actions/Delay.vue'
import RemoveTag from '~/components/Flow/Node/Actions/RemoveTag.vue'
import AddTag from '~/components/Flow/Node/Actions/AddTag.vue'
import Triggers from '~/components/Flow/Node/Triggers.vue'
import DataCollection from '~/components/Flow/Node/Actions/DataCollection.vue'
import { Node } from '~/models/Flow/Node.js'
import SetContactField from '~/components/Flow/Node/Actions/SetContactField.vue'
import Randomizer from '~/components/Flow/Node/Actions/Randomizer.vue'
import SendPrivateReply from '~/components/Flow/Node/Actions/Comment/SendPrivateReply.vue'
import ReplyComment from '~/components/Flow/Node/Actions/Comment/ReplyComment.vue'
import HideComment from '~/components/Flow/Node/Actions/Comment/HideComment.vue'
import Signature from '~/components/Flow/Node/Actions/Signature.vue'
import PauseFlows from '~/components/Flow/Node/Actions/PauseFlows.vue'

export default {
	components: {
		PauseFlows,
		Signature,
		SetContactField,
		Randomizer,
		SendPrivateReply,
		ReplyComment,
		HideComment,
		Triggers,
		AddTag,
		RemoveTag,
		Delay,
		ExternalRequest,
		TriggerFlow,
		SendMessage,
		DataCollection,
		Comparison,
		AddAction,
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
	},
	watch: {},
	props: {
		node: {
			type: Node,
			required: true,
		},
		collapseRef: {
			type: Object,
			default: null,
		},
		isMainNode: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			showRemoveModal: false,
		}
	},
	emits: ['continueFlow'],
	methods: {},
}
</script>
