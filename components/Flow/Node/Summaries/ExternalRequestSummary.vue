<template>
	<div class="text-sm text-base-content/80">
		<div v-if="node.config.requestConfig && node.config.requestConfig.url">
			<div class="flex items-center gap-2">
				<span class="badge badge-outline badge-sm">{{ node.config.requestConfig.method }}</span>
				<span class="font-mono text-xs">{{ node.config.requestConfig.url }}</span>
			</div>
			<div v-if="node.config.requestConfig.headers.length > 0" class="flex items-center text-xs gap-2 mt-1">
				<i class="fa fa-list"></i>
				<span
					>{{ node.config.requestConfig.headers.length }}
					<span v-if="node.config.requestConfig.headers.length !== 1">{{
						$t('components.flow.node.actions.externalRequestPartials.requestBuilder.summary.headers')
					}}</span>
					<span v-else>{{
						$t('components.flow.node.actions.externalRequestPartials.requestBuilder.summary.header')
					}}</span>
				</span>
			</div>
<!--			<div v-if="node.config.requestConfig.body" class="flex items-center gap-2 mt-1">-->
<!--				<i class="fa fa-database text-xs"></i>-->
<!--				<span>{{ getBodySummary() }}</span>-->
<!--			</div>-->
<!--			<div v-if="node.config.requestConfig.settings.responseVariable" class="flex items-center gap-2 mt-1">-->
<!--				<i class="fa fa-arrow-right text-xs"></i>-->
<!--				<span-->
<!--					>{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.summary.saveTo') }}-->
<!--					<code class="text-xs">{{ node.config.requestConfig.settings.responseVariable }}</code></span-->
<!--				>-->
<!--			</div>-->
<!--			<div v-if="node.config.requestConfig.settings.messagePath" class="flex items-center gap-2 mt-1">-->
<!--				<i class="fa fa-arrow-right text-xs"></i>-->
<!--				<span-->
<!--					>{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.summary.extract') }}-->
<!--					<code class="text-xs">{{ node.config.requestConfig.settings.messagePath }}</code></span-->
<!--				>-->
<!--			</div>-->
		</div>
		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.externalRequest.emptyState')" />
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
	},
	methods: {
		getBodySummary() {
			if (!this.node.config.requestConfig.body)
				return this.$t('components.flow.node.actions.externalRequestPartials.requestTest.noBody')

			if (this.node.config.requestConfig.body.type === 'form') {
				const fieldCount = this.node.config.requestConfig.body.fields
					? this.node.config.requestConfig.body.fields.length
					: 0
				const fieldText =
					fieldCount !== 1
						? this.$t('components.flow.node.actions.externalRequestPartials.requestTest.fields')
						: this.$t('components.flow.node.actions.externalRequestPartials.requestTest.field')
				return `${this.$t('components.flow.node.actions.externalRequestPartials.requestTest.formData')} (${fieldCount} ${fieldText})`
			} else if (this.node.config.requestConfig.body.type === 'json') {
				return this.$t('components.flow.node.actions.externalRequestPartials.requestTest.jsonBody')
			} else if (this.node.config.requestConfig.body.type === 'raw') {
				return this.$t('components.flow.node.actions.externalRequestPartials.requestTest.rawTextBody')
			}
			return this.$t('components.flow.node.actions.externalRequestPartials.requestTest.noBody')
		},
	},
}
</script>
