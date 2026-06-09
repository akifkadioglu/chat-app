<template>
	<div class="relative group cursor-pointer max-w-32">
		<img
			:src="attachment.url || attachment.preview_url"
			:alt="attachment.filename || 'Sticker'"
			class="w-full h-auto max-w-32 max-h-32 object-contain transition-transform duration-200 group-hover:scale-110"
			@error="onStickerError"
			@click="enlargeSticker"
		/>
		
		<!-- Loading state -->
		<div v-if="loading" class="absolute inset-0 bg-base-200 animate-pulse rounded-lg flex items-center justify-center">
			<i class="fa fa-smile text-2xl text-base-content opacity-50"></i>
		</div>

		<!-- Error state -->
		<div v-if="error" class="w-24 h-24 bg-error bg-opacity-10 rounded-lg flex items-center justify-center">
			<div class="text-center text-error">
				<i class="fa fa-exclamation-triangle text-lg mb-1"></i>
				<div class="text-xs">{{ $t('components.chat.content.messageTypes.stickerPreview.stickerLoadFailed') }}</div>
			</div>
		</div>

		<!-- Sticker info tooltip on hover -->
		<div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap" v-if="attachment.filename">
			{{ attachment.filename }}
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'StickerPreview',
	props: {
		attachment: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			loading: true,
			error: false
		}
	},
	methods: {
		onStickerError() {
			this.loading = false
			this.error = true
		},
		enlargeSticker() {
			if (!this.error) {
				// Modal açma işlemi burada yapılabilir
				console.log('Enlarge sticker:', this.attachment)
			}
		}
	}
}
</script>
