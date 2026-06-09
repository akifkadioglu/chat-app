<template>
	<div class="flex flex-col flex-1 overflow-hidden">
		<!-- Primary Header Section -->
		<div class="bg-success text-base-100 p-6 text-center">
			<h2 class="text-lg font-semibold mb-1">{{ $t('components.support.threadList.header.title') }} 👋</h2>
			<p class="text-sm text-base-100/80">{{ $t('components.support.threadList.header.subtitle') }}</p>
		</div>

		<!-- New Conversation Button -->
		<div class="p-4 border-t border-base-300 bg-base-100">
			<button @click="$emit('create-thread')" class="btn btn-primary w-full">
				<i class="fa fa-plus fa-lg" />
				{{ $t('components.support.threadList.newMessageButton') }}
			</button>
			<div class="text-center mt-2">
				<div class="text-xs text-base-content/50">{{ $t('components.support.threadList.replyTime') }}</div>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex-1 flex items-center justify-center">
			<div class="loading loading-spinner loading-md"></div>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="flex-1 flex items-center justify-center p-4">
			<div class="text-center">
				<div class="text-error text-sm mb-2">{{ error }}</div>
				<button @click="retryLoad" class="btn btn-outline btn-sm">{{ $t('components.support.threadList.errorState.retryButton') }}</button>
			</div>
		</div>

		<!-- Threads List (Scrollable) -->
		<div v-else class="flex-1 p-4 overflow-y-auto">
			<!-- Thread Cards -->
			<div v-if="threads.length > 0" class="space-y-3">
				<div class="mb-3 text-muted text-center">{{ $t('components.support.threadList.previousConversations') }}</div>
				<ThreadPreview
					v-for="thread in threads"
					:key="thread.id"
					:thread="thread"
					@open-thread="$emit('open-thread', $event)"
				/>
			</div>

			<!-- Empty State -->
			<div v-else class="flex-1 flex items-center justify-center py-12">
				<div class="text-center">
					<div class="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
						<i class="fa fa-comment-dots fa-2xl" />
					</div>
					<div class="text-base-content/70 text-sm mb-1">{{ $t('components.support.threadList.emptyState.title') }}</div>
					<div class="text-base-content/50 text-xs">{{ $t('components.support.threadList.emptyState.subtitle') }}</div>
				</div>
			</div>
		</div>
		<AiAssistantLinks
			:prompt="aiPrompt"
			class="mt-auto px-4 py-3 overflow-x-auto overflow-y-hidden flex items-center gap-2"
			:show-perplexity="false"
		/>
	</div>
</template>

<script>
import ThreadPreview from './ThreadPreview.vue'
import AiAssistantLinks from './AiAssistantLinks.vue'
import apiList from '~/apis/ApiList.js'

export default {
	name: 'ThreadList',
	components: {
		ThreadPreview,
		AiAssistantLinks,
	},
	setup() {
		return {
			runtimeConfig: useRuntimeConfig(),
		}
	},
	data() {
		return {
			threads: [],
			loading: false,
			error: null,
		}
	},
	mounted() {
		this.loadConversations()
	},
	computed: {
		aiPrompt() {
			const chatUrl = this.$mergeDomainNPath(
				this.runtimeConfig.public.baseUrl,
				this.$t('components.support.threadList.chatPath'),
			)
			return encodeURIComponent(
				this.$t('components.support.threadList.aiPrompt', {
					chatUrl: chatUrl,
				}),
			)
		},
	},
	methods: {
		loadConversations() {
			if (this.loading) {
				return
			}

			this.loading = true
			this.error = null

			this.$requestAdapter
				.get(apiList.thread.list)
				.then((response) => {
					this.threads = response.data.threads
					this.loadTime = new Date().getTime()
				})
				.catch((err) => {
					this.error = err.message || 'Failed to load conversations'
					console.error('Support conversations error:', err)
				})
				.finally(() => {
					this.loading = false
				})
		},

		retryLoad() {
			this.loadConversations()
		},
	},
	emits: ['open-thread', 'create-thread'],
}
</script>
