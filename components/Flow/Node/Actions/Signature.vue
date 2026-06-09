<template>
	<div class="space-y-4">
		<!-- Header -->
		<div>
			<i18n-t tag="h2" class="text-lg mb-2" keypath="components.flow.node.actions.signature.title">
				<template #simpliers><SimpliersLogo /></template>
			</i18n-t>
			<p class="text-muted text-xs">
				<i class="fa fa-info-circle text-info" />
				{{ $t('components.flow.node.actions.signature.description') }}
			</p>

			<button
				@click="
					$emitter.emit('showUpgradeModal', {
						chatAccount: flowStore.flow.chatAccount,
						feature: 'signatureNode',
					})
				"
				class="btn btn-soft btn-primary btn-sm mt-2"
			>
				{{ $t('components.flow.node.actions.signature.subscribe') }}
			</button>
		</div>
		<div class="space-y-3 max-w-116 mx-auto">
			<!-- Edit Mode - Message Content -->
			<div class="space-y-3">
				<!--								<div-->
				<!--									v-for="(content, index) in messageContents"-->
				<!--									:key="content.id"-->
				<!--									:class="{ 'border-primary': draggedIndex === index }"-->
				<!--								>-->
				<!--									&lt;!&ndash; Content Header &ndash;&gt;-->
				<!--									<div class="flex justify-between items-start mb-3 w-full">-->
				<!--										&lt;!&ndash; Content Component &ndash;&gt;-->
				<!--										<div class="relative flex-1 w-full">-->
				<!--											<SignatureTextMessage :node="node" />-->
				<!--										</div>-->
				<!--									</div>-->
				<!--								</div>-->
				<SignatureTextMessage :node="node" />
			</div>
		</div>
	</div>
</template>

<script>
import ImageMessage from './SendMessagePartials/ImageMessage.vue'
import AudioMessage from './SendMessagePartials/AudioMessage.vue'
import VideoMessage from './SendMessagePartials/VideoMessage.vue'
import DynamicMessage from './SendMessagePartials/DynamicMessage.vue'
import DelayMessage from './SendMessagePartials/DelayMessage.vue'
import QuickReply from './SendMessagePartials/QuickReply.vue'
// import SendMessagePreview from './SendMessagePartials/SendMessagePreview.vue'
import { Node } from '~/models/Flow/Node.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import SignatureTextMessage from '~/components/Flow/Node/Actions/Components/SignatureTextMessage.vue'

export default {
	components: {
		SignatureTextMessage,
		SimpliersLogo,
		CustomDropdown,
		ImageMessage,
		AudioMessage,
		VideoMessage,
		DynamicMessage,
		DelayMessage,
		QuickReply,
		// SendMessagePreview,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		isMainNode: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			showPreview: false,
			draggedIndex: null,
			dragStartY: 0,
		}
	},
	mounted() {
		if (this.messageContents.length === 0) {
			this.messageContents = [
				{
					type: 'text',
				},
			]
		}
	},
	computed: {
		messageContents: {
			get() {
				return this.node.config.contents || []
			},
			set(value) {
				if (!this.node.config) this.node.config = {}
				this.node.config.contents = value
			},
		},
	},
}
</script>
