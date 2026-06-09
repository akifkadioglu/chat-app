<template>
	<div class="bg-base-100 rounded-lg shadow-sm border border-base-300 max-w-xs overflow-hidden">
		<!-- Header -->
		<div class="flex items-center justify-between p-3 border-b border-base-300">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-full bg-overlay"></div>
				<div>
					<div class="h-3 w-20 bg-overlay rounded mb-1"></div>
					<div class="h-2 w-16 bg-muted rounded"></div>
				</div>
			</div>
			<div class="w-4 h-4 bg-overlay rounded"></div>
		</div>

		<!-- Video -->
		<div class="relative aspect-[9/16] bg-black">
			<img
				v-if="attachment.url && !imageError && !videoLoaded"
				:src="attachment.url"
				class="w-full h-full object-cover"
				@error="onImageError"
				@load="onImageLoad"
				alt=""
			/>

			<video
				v-if="attachment.url && (imageError || videoLoaded)"
				:src="attachment.url || attachment.preview_url"
				class="w-full h-full object-cover"
				preload="metadata"
				@click="togglePlay"
				@error="onVideoError"
				@loadeddata="onVideoLoad"
				ref="videoElement"
				loop
				controls
			/>
			<!--			<video-->
			<!--				v-if="!error"-->
			<!--				:src="attachment.url"-->
			<!--				class="w-full h-full object-cover"-->
			<!--				@error="error = true"-->
			<!--				@click="togglePlay"-->
			<!--				ref="videoElement"-->
			<!--				loop-->
			<!--			/>-->

			<!-- Play Button -->
			<!--			<button v-if="!isPlaying" @click="playVideo" class="absolute inset-0 flex items-center justify-center">-->
			<!--				<div-->
			<!--					class="w-16 h-16 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 flex items-center justify-center shadow-lg transition-all duration-200"-->
			<!--				>-->
			<!--					<i class="fa fa-play text-black text-xl ml-1"></i>-->
			<!--				</div>-->
			<!--			</button>-->

			<!-- Badge -->
			<div class="absolute top-3 left-3 bg-black bg-opacity-60 rounded-full px-2 py-1 flex items-center gap-1">
				<i class="fa-brands fa-instagram text-xs"></i>
				<span class="text-xs font-medium">Reels</span>
			</div>

			<!-- Error -->
			<div v-if="error" class="absolute inset-0 flex items-center justify-center text-center">
				<div>
					<i class="fab fa-instagram text-3xl mb-2 opacity-50"></i>
					<div class="text-sm">{{ $t('components.chat.content.messageTypes.igReelPreview.videoLoadFailed') }}</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="p-3">
<!--			<div class="flex items-center justify-between mb-2">-->
<!--				<div class="flex items-center gap-3">-->
<!--					<div class="flex items-center gap-1">-->
<!--						<div class="w-4 h-4 bg-overlay rounded"></div>-->
<!--						<div class="h-2 w-6 bg-muted rounded"></div>-->
<!--					</div>-->
<!--					<div class="flex items-center gap-1">-->
<!--						<div class="w-4 h-4 bg-overlay rounded"></div>-->
<!--						<div class="h-2 w-8 bg-muted rounded"></div>-->
<!--					</div>-->
<!--					<div class="w-4 h-4 bg-overlay rounded"></div>-->
<!--				</div>-->
<!--				<div class="h-2 w-10 bg-muted rounded"></div>-->
<!--			</div>-->

			<div v-if="attachment.title" class="text-xs font-medium truncate text-base-content">
				{{ attachment.title }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {
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
			loading: true,
			imageError: false,
			videoError: false,
			videoLoaded: false,
		}
	},
	methods: {
		onImageLoad() {
			this.loading = false
		},
		onImageError() {
			console.log('Image load error, trying video...')
			this.imageError = true
			// Image yüklenemedi, video deneyelim
		},
		onVideoLoad() {
			this.videoLoaded = true
			this.loading = false
		},
		onVideoError() {
			this.videoError = true
			this.loading = false
		},
		playVideo() {
			if (this.error) return
			const video = this.$refs.videoElement as HTMLVideoElement
			if (video) {
				video.play()
				this.isPlaying = true
			}
		},
		togglePlay() {
			const video = this.$refs.videoElement as HTMLVideoElement
			if (video.paused) {
				video.play()
				this.isPlaying = true
			} else {
				video.pause()
				this.isPlaying = false
			}
		},
	},
}
</script>
