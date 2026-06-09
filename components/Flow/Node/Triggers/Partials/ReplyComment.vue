<template>
	<CustomToggleSwitch
		v-model="config.showReplyComment"
		:title="$t('components.flow.node.triggers.partials.replyComment.title')"
		:description="$t('components.flow.node.triggers.partials.replyComment.description')"
		icon-class="fa fa-comments"
	>
		<div v-auto-animate>
			<div v-if="config.showReplyComment" class="ps-4 my-5 flex flex-col gap-3">
				<ReplyCommentForm ref="ReplyCommentForm" :config="config" />
				<Collapse showArrow class="bg-subtle rounded-xl" titleClass="py-3" open>
					<template #title>
						<label>
							{{ $t('components.flow.node.actions.comment.replyComment.sendOptions') }}
						</label>
					</template>

					<div class="space-y-4">
						<div>
							<label class="flex items-baseline gap-3">
								<input
									v-model="config.sendRandomly"
									type="radio"
									:value="true"
									name="sendType"
									class="radio radio-primary radio-xs"
								/>
								<span class="block">
									<span class="text-sm">
										{{ $t('components.flow.node.actions.comment.replyComment.sendRandomly') }}
									</span>
									<small class="block text-xs text-base-content/70">
										{{ $t('components.flow.node.actions.comment.replyComment.sendRandomlyDesc') }}
									</small>
								</span>
							</label>
						</div>

						<div>
							<label class="flex items-baseline gap-3">
								<input
									v-model="config.sendRandomly"
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
	</CustomToggleSwitch>
</template>

<script>
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import ReplyCommentForm from '~/components/Flow/Quick/Components/ReplyCommentForm.vue'
import ToggleSwitch from '~/components/Flow/Node/Triggers/Partials/ToggleSwitch.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	components: { ChatLogo, SimpliersLogo, ToggleSwitch, Collapse, CustomToggleSwitch, ReplyCommentForm },
	props: {
		config: {
			type: Object,
		},
	},
}
</script>
