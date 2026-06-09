<template>
	<div
		class="flex items-baseline gap-3 px-4 py-3 border border-base-200 rounded-lg group hover:bg-base-200/30 transition-colors"
	>
		<!-- Flow Info -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<span class="text-xs text-muted"> #{{ flow.id }} </span>
				<LocalizedLink
					:name="flow.route.name"
					:params="flow.route.params"
					class="font-medium truncate link"
					target="_blank"
				>
					{{ flow.name }}
					<i class="fa fa-external-link link-icon text-xs mr-1" />
				</LocalizedLink>
			</div>
			<div class="flex items-center gap-3 mt-1 text-xs text-muted">
				<span v-if="flow.flowRunsCount > 0">
					<i class="fa fa-info-circle text-info" />
					{{ $t('components.flow.triggerSingleFlow.flowCompactCard.runCount') }}
				</span>
				<!--				<span v-else>{{ $t('components.flow.triggerSingleFlow.flowCompactCard.neverRan') }}</span>-->
				<!--				<span>•</span>-->
				<!--				<span>{{ $formatTimeAgo(flow.publishedAt ?? flow.createdAt, $i18n.locale) }}</span>-->
			</div>
			<!-- TODO :: TriggerSummary gelebilir buraya -->
			<!-- <div class=mt-1""></div> -->
		</div>

		<!-- Action Button -->
		<button
			class="btn btn-soft btn-primary btn-sm group-hover:!btn-active group-hover:!text-white !transition-all duration-100"
			:disabled="runningFlowIds.includes(flow.id)"
			@click="$emit('triggerFlowById', flow.id)"
		>
			<LoadingElement size="16" :isLoading="runningFlowIds.includes(flow.id)">
				<i class="fa fa-play text-xs" />
			</LoadingElement>
			{{ $t('components.flow.triggerSingleFlow.flowCompactCard.runButton') }}
		</button>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'

export default {
	components: { LocalizedLink, LoadingElement },
	emits: ['triggerFlowById'],
	props: {
		flow: {
			type: Flow,
			required: true,
		},
		runningFlowIds: {
			type: Array,
			default: () => [],
		},
	},
}
</script>

<style scoped></style>
