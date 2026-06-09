<template>
	<div class="bg-white rounded-lg shadow-sm border border-base-300 max-w-xs overflow-hidden min-w-60">
		<!-- Story Content -->
		<div class="relative aspect-[9/16] bg-black">
			<!-- Image Story -->
			<!--			<img-->
			<!--				v-if="!error && attachment.type === 'image'"-->
			<!--				:src="attachment.story_media_url"-->
			<!--				class="w-full h-full object-cover"-->
			<!--				@error="error = true"-->
			<!--				@load="loading = false"-->
			<!--			/>-->

			<!-- Video Story -->
			<!--				v-else-if="!error && attachment.type === 'video'"-->
			<video
				:src="attachment.story_media_url"
				class="w-full h-full object-cover"
				@error="error = true"
				@click="togglePlay"
				ref="videoElement"
				loop
			/>

			<!-- Loading State -->
<!--			<div v-if="loading" class="absolute inset-0 bg-gray-800 animate-pulse"></div>-->

			<!-- Play Button for Video -->
			<button
				v-if="attachment.type === 'video' && !isPlaying && !loading"
				@click="playVideo"
				class="absolute inset-0 flex items-center justify-center"
			>
				<div
					class="w-12 h-12 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center shadow-lg transition-all duration-200"
				>
					<i class="fa fa-play font-extrabold text-lg ml-0.5"></i>
				</div>
			</button>

			<!-- Story Progress Bar -->
			<div class="absolute top-2 left-2 right-2">
				<div class="h-0.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
					<div class="h-full bg-white rounded-full w-1/3"></div>
				</div>
			</div>

			<!-- Instagram Story Badge -->
			<div class="absolute top-8 left-2">
				<div class="bg-black bg-opacity-50 rounded-full px-2 py-1 flex items-center gap-1">
					<i class="fab fa-instagram text-white text-xs"></i>
					<span class="text-white text-xs font-medium">Story</span>
				</div>
			</div>

			<!-- Error State -->
			<div v-if="error" class="absolute inset-0  flex items-center justify-center text-center text-white">
				<div>
					<i class="fab fa-instagram text-3xl mb-2 opacity-50"></i>
					<div class="text-sm">{{ $t('components.chat.content.messageTypes.igStoryPreview.storyLoadFailed') }}</div>
				</div>
			</div>
		</div>

		<!-- Caption/Text -->
		<div v-if="attachment.title" class="p-3 border-t border-base-300">
			<div class="text-xs text-muted">
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
			// loading: true,
			isPlaying: false,
		}
	},
	methods: {
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
