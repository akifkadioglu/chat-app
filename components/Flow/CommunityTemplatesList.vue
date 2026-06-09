<template>
	<div class="pt-5">
		<div v-if="loading" class="text-center py-10">
			<LoadingElement :isLoading="true" size="24" />
		</div>
		<div v-else-if="!filteredTemplates.length" class="text-center py-16 text-muted">
			<i class="fa fa-users text-4xl mb-3 opacity-50" />
			<div class="text-sm">{{ $t('components.flow.communityTemplatesList.emptyState') }}</div>
		</div>
		<div v-else class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			<LocalizedLink
				v-for="template in filteredTemplates"
				:key="template.id"
				name="flow-shared-slug"
				:params="{ slug: template.slug }"
				class="no-underline group block h-full"
				@click="onSelect"
			>
				<CreateFlowModalElement
					community
					:postAccount="getAccount(template)"
					:flowName="template.flow?.name"
					:usageCount="template.sourced_flows_count ?? template.sourcedFlowsCount ?? 0"
				/>
			</LocalizedLink>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import CreateFlowModalElement from '~/components/Flow/CreateFlowModalElement.vue'

export default {
	components: { CreateFlowModalElement, LocalizedLink, LoadingElement },
	emits: ['select'],
	props: {
		searchQuery: {
			type: String,
			default: '',
		},
		limit: {
			type: Number,
			default: null,
		},
	},
	data() {
		return {
			loading: false,
			templates: [],
		}
	},
	computed: {
		filteredTemplates() {
			let list = this.templates
			if (this.searchQuery) {
				const q = this.searchQuery.toLowerCase()
				list = list.filter((t) => (t.flow?.name || '').toLowerCase().includes(q))
			}
			if (this.limit) {
				list = list.slice(0, this.limit)
			}
			return list
		},
	},
	mounted() {
		this.loadTemplates()
	},
	methods: {
		onSelect() {
			this.$emit('select')
		},
		nodeCount(template) {
			return template.graph?.nodes?.length ?? 0
		},
		getAccount(template) {
			const chat = template.flow?.chat_account || template.flow?.chatAccount
			return chat?.post_account || chat?.postAccount || null
		},
		loadTemplates() {
			this.loading = true
			this.$requestAdapter
				.get(apiList.chat.flow.library)
				.then((res) => {
					this.templates = res.data
				})
				.finally(() => {
					this.loading = false
				})
		},
	},
}
</script>
