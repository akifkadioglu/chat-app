<template>
	<div class="w-full">
		<div v-if="contents && contents.length > 0" class="flex flex-col gap-5 text-xs w-full">
			<div v-for="content in contents" :key="content.id" class="w-full">
				<i18n-t tag="div" keypath="components.flow.node.actions.sendMessage.contentTypeSummary" class="text-xs text-muted">
					<template #type>
						<span v-if="content.type === 'text'">
							<span>{{ $t('components.flow.node.actions.sendMessage.contentTypes.text') }}</span>
						</span>
						<span v-else-if="content.type === 'image'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.image') }}
						</span>
						<span v-else-if="content.type === 'audio'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.audio') }}
						</span>
						<span v-else-if="content.type === 'video'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.video') }}
						</span>
						<span v-else-if="content.type === 'file'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.file') }}
						</span>
						<span v-else-if="content.type === 'card'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.card') }}
						</span>
						<span v-else-if="content.type === 'dynamic'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.dynamic') }}
						</span>
						<span v-else-if="content.type === 'delay'">
							{{ $t('components.flow.node.actions.sendMessage.contentTypes.delay') }}
						</span>
						<span v-else>
							{{ content.type }}
						</span>
					</template>
				</i18n-t>
				<div
					class="rounded-lg p-2 w-full"
					:class="{
						truncate: isCompactMode,
						'bg-subtle': shouldShowBackground(content),
					}"
				>
					<span
						v-if="content.type === 'text'"
						class="text-sm font-normal"
						:class="{ 'text-subtle font-light italic': isCompactMode }"
					>
						<span v-if="content.text?.trim()" class="whitespace-pre-line line-clamp-3">
							{{ content.text }}
						</span>
						<span v-else class="text-subtle"> {{ $t('components.flow.node.summaries.sendMessage.emptyState') }} </span>
					</span>
					<span v-if="content.type === 'image'">
						<i class="fa fa-image" /> {{ content.image?.name }}
						<!--						<img class="w-25 h-auto ml-auto rounded-lg" :src="content.image?.url" :alt="content.image?.name" />-->
					</span>
					<span v-if="content.type === 'audio'"> <i class="fa fa-microphone" /> {{ content.audio?.name }} </span>
					<span v-if="content.type === 'video'" class="break-all">
						<i class="fa fa-video" /> {{ content.video?.name }}
					</span>
					<span v-if="content.type === 'file'">
						<i class="fa fa-file-pdf" /> {{ content.file?.name }}
					</span>
					<span v-if="content.type === 'card'">
						<!--						TODO: @akif buraya preview lazım-->
					</span>
					<span v-if="content.type === 'dynamic'">
						<i>{{ $t('components.flow.node.summaries.sendMessage.dynamicContentPlaceholder') }}</i>
					</span>
					<span v-if="content.type === 'delay'">
						{{ $t('components.flow.node.summaries.sendMessage.duration', { duration: content.delay?.duration ?? 3 }) }}
					</span>
					<slot v-bind="content" />
				</div>
			</div>
			<span v-if="node.config.contents.length > 3 && isCompactMode" class="badge badge-xs">
				+{{ node.config.contents.length - 3 }} {{ $t('components.flow.node.actions.sendMessage.moreItems') }}
			</span>
		</div>
		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.sendMessage.emptyState')" />
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
		isCompactMode: {
			type: Boolean,
			default: true,
		},
	},

	computed: {
		contents() {
			if (this.isCompactMode) {
				return this.node.config?.contents.slice(0, 3)
			}
			return this.node.config?.contents
		},
		mediaTypes() {
			return ['generic']
		},
		shouldShowBackground() {
			return (content) => !this.isCompactMode && !this.mediaTypes.includes(content.type)
		},
	},
}
</script>
