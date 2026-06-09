<template>
	<div>
		<h4 class="text-sm font-medium mb-3">{{ $t('components.flow.node.actions.comment.replyComment.title') }}</h4>

		<div class="space-y-4">
			<!-- Reply Messages -->
			<div class="space-y-3">
				<div v-for="(reply, index) in node.config.replies" :key="index" class="flex items-center gap-2">
					<TextareaAutosize
						v-model="reply.text"
						type="text"
						:placeholder="$t('components.flow.node.actions.comment.replyComment.replyPlaceholder')"
						class="input input-bordered flex-1"
						maxlength="500"
						rows="1"
					/>
					<button
						v-if="node.config.replies?.length > 1"
						@click="removeReply(index)"
						class="btn btn-sm btn-error btn-outline"
					>
						<i class="fa fa-trash"></i>
					</button>
				</div>

				<button @click="addReply" class="btn btn-soft btn-sm" :disabled="node.config.replies?.length >= maxReplyLimit">
					<i class="fa fa-plus"></i>
					{{ $t('components.flow.node.actions.comment.replyComment.addReply') }}
				</button>
			</div>

			<!-- Send Options -->
			<Collapse showArrow class="bg-subtle rounded-xl" titleClass="py-3">
				<template #title>
					<label class="label">
						{{ $t('components.flow.node.actions.comment.replyComment.sendOptions') }}
					</label>
				</template>

				<div class="space-y-4">
					<div>
						<label class="label justify-start gap-3">
							<input
								v-model="node.config.sendRandomly"
								type="radio"
								:value="true"
								name="sendType"
								class="radio radio-primary radio-xs"
							/>
							<span class="block">
								<span class="text-sm">{{ $t('components.flow.node.actions.comment.replyComment.sendRandomly') }}</span>
								<small class="block text-xs text-base-content/70">
									{{ $t('components.flow.node.actions.comment.replyComment.sendRandomlyDesc') }}
								</small>
							</span>
						</label>
					</div>

					<div>
						<label class="label justify-start gap-3">
							<input
								v-model="node.config.sendRandomly"
								type="radio"
								:value="false"
								name="sendType"
								class="radio radio-primary radio-xs"
							/>
							<span class="block">
								<span class="text-sm">{{ $t('components.flow.node.actions.comment.replyComment.sendInOrder') }}</span>
								<small class="block text-xs text-base-content/70">
									{{ $t('components.flow.node.actions.comment.replyComment.sendInOrderDesc') }}
								</small>
							</span>
						</label>
					</div>
				</div>
			</Collapse>
		</div>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.ts'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'

export default {
	components: { TextareaAutosize, Collapse },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	data() {
		return {
			maxReplyLimit: 10,
		}
	},
	mounted() {
		// this.initializeConfig()
	},
	methods: {
		// initializeConfig() {
		// 	if (!this.node.config.replies) {
		// 		this.node.config.replies = [{ text: '' }]
		// 	}
		// 	if (this.node.config.sendRandomly === undefined) {
		// 		this.node.config.sendRandomly = false
		// 	}
		// },
		addReply() {
			if (this.node.config.replies.length < this.maxReplyLimit) {
				this.node.config.replies.push({ text: '' })
			}
		},
		removeReply(index) {
			if (this.node.config.replies.length > 1) {
				this.node.config.replies.splice(index, 1)
			}
		},
	},
}
</script>
