<template>
	<div class="rounded-lg flex items-baseline gap-2">
		<div class="flex-1">
			<div class="flex-1 flex rounded-lg p-px bg-indigo-500/10">
				<input
					v-model="reply.title"
					type="text"
					:placeholder="$t('components.flow.node.actions.sendMessagePartials.quickReply.replyTextPlaceholder')"
					class="input border-none input-sm w-full bg-transparent text-indigo-500"
					:class="{ 'input-error': fieldError }"
					@blur="validateField"
					@input="validateField"
					maxlength="40"
				/>
				<div class="flex gap-1 items-center">
					<div class="w-min bg-muted p-1 rounded-lg flex">
						<CloseAction
							:action="actionNode"
							@create:action="addNodeToReply"
							@add:edge="addEdgeToReply"
							@delete:action="removeActionFromReply"
							addActionRendererTitleClass="truncate w-8"
						/>
					</div>

					<button @click="$emit('remove')" class="btn btn-xs btn-ghost text-error p-1">
						<i class="fa-solid fa-trash" />
					</button>
				</div>
			</div>
			<div v-if="fieldError" class="text-error text-xs mt-1">
				{{ fieldError }}
			</div>
		</div>
	</div>
</template>

<script>
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: { CloseAction },
	props: {
		reply: {
			type: Object,
			required: true,
		},
		actionNode: {
			type: Node,
			default: null,
		},
	},
	emits: ['remove', 'addAction', 'addEdge'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			fieldError: null,
		}
	},
	methods: {
		addNodeToReply(newNode) {
			if (!this.reply.payload) {
				this.reply.payload = v4()
			}
			this.$emit('addAction', { action: newNode, guard: this.reply.payload })
		},
		addEdgeToReply(toNodeUuid) {
			if (!this.reply.payload) {
				this.reply.payload = v4()
			}
			this.$emit('addEdge', { toNodeUuid, guard: this.reply.payload })
		},
		removeActionFromReply() {
			if (this.actionNode) {
				this.flowStore.flow.removeNode(this.actionNode)
			}
		},
		validateField() {
			const value = this.reply.title

			if (!value || value.trim() === '') {
				this.fieldError = this.$t('components.flow.node.actions.sendMessagePartials.quickReply.required')
				return false
			}

			if (value.length > 20) {
				this.fieldError = this.$t('components.flow.node.actions.sendMessagePartials.quickReply.maxLength')
				return false
			}

			this.fieldError = null
			return true
		},
	},
}
</script>
