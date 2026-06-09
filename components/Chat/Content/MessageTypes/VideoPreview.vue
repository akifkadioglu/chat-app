<template>
	<div class="relative group cursor-pointer rounded-lg overflow-hidden bg-base-200 max-w-xs min-h-72 min-w-60">
		<video
			v-if="!error"
			:src="attachment.url || attachment.preview_url"
			:poster="attachment.thumbnail_url"
			class="w-full h-auto max-h-64 object-cover"
			preload="metadata"
			@error="onVideoError"
			@click="togglePlay"
			ref="videoElement"
		/>

		<!-- Play button overlay -->
		<div
			class="absolute inset-0 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200"
		>
			<button
				@click="togglePlay"
				class="btn btn-circle btn-lg bg-white bg-opacity-90 hover:bg-opacity-100 border-0 font-extrabold"
			>
				<i :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'" class="text-xl"></i>
			</button>
		</div>

		<!-- Fullscreen button -->
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			<button
				@click="toggleFullscreen"
				class="btn btn-circle btn-sm bg-black bg-opacity-50 hover:bg-opacity-70 border-0 text-white"
				:title="$t('components.chat.content.messageTypes.videoPreview.fullScreen')"
			>
				<i class="fa fa-expand text-xs"></i>
			</button>
		</div>

		<!-- Video info -->
		<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-content to-transparent p-3">
			<div class="text-white text-xs">
				<div v-if="attachment.filename" class="font-medium mb-1">
					{{ attachment.filename }}
				</div>
				<div class="flex items-center gap-2 opacity-75">
					<span v-if="attachment.duration">
						<i class="fa fa-clock mr-1"></i>
						{{ formatDuration(attachment.duration) }}
					</span>
					<span v-if="attachment.size">
						{{ formatFileSize(attachment.size) }}
					</span>
				</div>
			</div>
		</div>

		<!-- Error state -->
		<div v-if="error" class="w-full h-32 bg-error bg-opacity-10 flex items-center justify-center">
			<div class="text-center text-error">
				<i class="fa fa-exclamation-triangle text-xl mb-1"></i>
				<div class="text-xs">{{ $t('components.chat.content.messageTypes.videoPreview.videoLoadFailed') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { formatFileSize } from '~/helpers/fileUploadFunctions'

export default {
	name: 'VideoPreview',
	props: {
		attachment: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			error: false,
			isPlaying: false,
			isFullscreen: false,
		}
	},
	mounted() {
		// Listen for fullscreen changes
		document.addEventListener('fullscreenchange', this.onFullscreenChange)
		document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
		document.addEventListener('mozfullscreenchange', this.onFullscreenChange)
		document.addEventListener('MSFullscreenChange', this.onFullscreenChange)
	},
	beforeUnmount() {
		// Clean up event listeners
		document.removeEventListener('fullscreenchange', this.onFullscreenChange)
		document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
		document.removeEventListener('mozfullscreenchange', this.onFullscreenChange)
		document.removeEventListener('MSFullscreenChange', this.onFullscreenChange)
	},
	methods: {
		formatFileSize,
		onVideoError() {
			this.error = true
		},
		togglePlay() {
			if (this.error) return

			const video = this.$refs.videoElement as HTMLVideoElement
			if (video.paused) {
				video.play()
				this.isPlaying = true
			} else {
				video.pause()
				this.isPlaying = false
			}
		},
		async toggleFullscreen() {
			if (this.error) return

			const video = this.$refs.videoElement as HTMLVideoElement

			try {
				if (!this.isFullscreen) {
					// Enter fullscreen
					if (video.requestFullscreen) {
						await video.requestFullscreen()
					} else if (video.webkitRequestFullscreen) {
						await video.webkitRequestFullscreen()
					} else if (video.mozRequestFullScreen) {
						await video.mozRequestFullScreen()
					} else if (video.msRequestFullscreen) {
						await video.msRequestFullscreen()
					}
				} else {
					// Exit fullscreen
					if (document.exitFullscreen) {
						await document.exitFullscreen()
					} else if (document.webkitExitFullscreen) {
						await document.webkitExitFullscreen()
					} else if (document.mozCancelFullScreen) {
						await document.mozCancelFullScreen()
					} else if (document.msExitFullscreen) {
						await document.msExitFullscreen()
					}
				}
			} catch (error) {
				console.error('Fullscreen error:', error)
			}
		},
		onFullscreenChange() {
			// Check if we're in fullscreen mode
			this.isFullscreen = !!(
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement
			)
		},
		formatDuration(seconds: number): string {
			const mins = Math.floor(seconds / 60)
			const secs = Math.floor(seconds % 60)
			return `${mins}:${secs.toString().padStart(2, '0')}`
		},
	},
}
</script>
