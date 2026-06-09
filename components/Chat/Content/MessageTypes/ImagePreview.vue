<template>
	<div class="relative group cursor-pointer rounded-lg overflow-hidden bg-base-200 max-w-xs min-h-36 min-w-48">
		<img
			:src="attachment.url || attachment.preview_url"
			:alt="attachment.filename || 'Image'"
			class="object-fit transition-transform duration-200 group-hover:scale-105"
			@load="onImageLoad"
			@error="onImageError"
			@click="openFullscreen"
		/>

		<!-- Loading state -->
		<div v-if="loading" class="absolute inset-0 bg-base-200 animate-pulse flex items-center justify-center">
			<i class="fa fa-image text-2xl text-base-content opacity-50"></i>
		</div>

		<!-- Error state -->
		<div v-if="error" class="absolute inset-0 bg-error bg-opacity-10 flex items-center justify-center">
			<div class="text-center text-error">
				<i class="fa fa-exclamation-triangle text-xl mb-1"></i>
				<div class="text-xs">{{ $t('components.chat.content.messageTypes.imagePreview.imageLoadFailed') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox'
import { formatFileSize } from '~/helpers/fileUploadFunctions'

export default {
	name: 'ImagePreview',
	components: {
		VueEasyLightbox,
	},
	props: {
		attachment: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			loading: true,
			error: false,
			visible: false,
		}
	},
	methods: {
		formatFileSize,
		onImageLoad() {
			this.loading = false
		},
		onImageError() {
			this.loading = false
			this.error = true
		},
		openFullscreen() {
			if (!this.error) {
				this.$emitter.emit('showMediaPreviewLightbox', {
					url: this.attachment.url || this.attachment.preview_url,
					type: 'image',
				})
				this.visible = true
				console.log('Open fullscreen image:', this.attachment)
			}
		},
	},
}
</script>
