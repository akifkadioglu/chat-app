<template>
	<div
		@click="openThread"
		class="bg-base-100 border border-base-300 rounded-lg p-3 hover:bg-primary/5 hover:border-primary/60 cursor-pointer transition-all duration-200 hover:shadow-lg"
	>
		<!-- First Row: Name, Time, Button -->
		<div class="flex items-center space-x-2 flex-1 min-w-0">
			<div v-if="!thread.read" class="w-2 h-2 bg-simpliers rounded-full flex-shrink-0" />
			<div class="font-medium text-sm text-base-content truncate">
				{{ thread.last_message?.[0]?.name || $t('components.support.threadPreview.unknownUser') }}
			</div>
			<div class="text-xs text-base-content/50 flex-shrink-0">
				{{ formatDate(thread.updated_at) }}
			</div>
		</div>

		<!-- Second Row: Message -->
		<div class="flex justify-between items-center mb-2">
			<div class="text-sm text-base-content/70 truncate">
				{{ thread.last_message?.[0]?.message || $t('components.support.threadPreview.noMessage') }}
			</div>

			<button class="btn btn-xs btn-soft btn-primary ml-2 flex-shrink-0 rounded">
				{{ $t('components.support.threadPreview.openChatButton') }}
				<i class="fa fa-chevron-right link-icon" />
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ThreadPreview',
	props: {
		thread: {
			type: Object,
			required: true,
		},
	},
	methods: {
		openThread() {
			this.$emit('open-thread', this.thread)
		},

		formatDate(dateString) {
			const date = new Date(dateString)
			const now = new Date()
			const diff = now - date
			const hours = Math.floor(diff / (1000 * 60 * 60))

			if (hours < 1) {
				const minutes = Math.floor(diff / (1000 * 60))
				return `${minutes}m ago`
			} else if (hours < 24) {
				return `${hours}h ago`
			} else {
				const days = Math.floor(hours / 24)
				if (days < 7) {
					return `${days}d ago`
				} else {
					return date.toLocaleDateString()
				}
			}
		},
	},
}
</script>
