<template>
	<div class="flex items-center gap-2 rounded-lg p-2 max-w-xs -mx-1">
		<!-- Play/Pause Button -->
		<button
			@click="togglePlay"
			class="btn btn-circle btn-sm bg-primary text-white hover:bg-primary-focus flex-shrink-0"
			:disabled="error"
		>
			<i v-if="loading" class="fa fa-spinner fa-spin text-xs"></i>
			<i v-else-if="isPlaying" class="fa fa-pause text-xs"></i>
			<i v-else class="fa fa-play text-xs"></i>
		</button>

		<!-- Waveform and Info -->
		<div class="flex-1 min-w-0">
			<!-- Waveform Visualization -->
			<div class="flex items-center justify-center h-7 mb-1" @click="seekAudio">
				<div class="flex items-end gap-0.5 cursor-pointer" ref="waveformContainer">
					<div
						v-for="(bar, index) in waveformBars"
						:key="index"
						class="w-1 rounded-full transition-all duration-100"
						:class="index <= Math.floor((progress / 100) * waveformBars.length) ? 'bg-primary' : 'bg-base-300'"
						:style="{ height: `${bar}px` }"
					></div>
				</div>
			</div>

			<!-- Time Info -->
			<div class="text-xs text-base-content opacity-60 text-center">
				<span v-if="attachment.duration">
					{{ formatDuration(currentTime) }} / {{ formatDuration(attachment.duration) }}
				</span>
				<span v-else-if="attachment.size" class="text-xs">
					{{ formatFileSize(attachment.size) }}
				</span>
			</div>
		</div>

		<!-- Hidden Audio Element -->
		<audio
			ref="audioElement"
			:src="attachment.url"
			@loadstart="loading = true"
			@canplay="loading = false"
			@error="onAudioError"
			@timeupdate="updateProgress"
			@ended="onAudioEnded"
			preload="metadata"
		/>

		<!-- Error State -->
		<div v-if="error" class="absolute inset-0 bg-error bg-opacity-10 rounded-lg flex items-center justify-center">
			<div class="text-center text-error">
				<i class="fa fa-exclamation-triangle text-sm mb-1"></i>
				<div class="text-xs">{{ $t('components.chat.content.messageTypes.audioPreview.audioLoadFailed') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { formatFileSize } from '~/helpers/fileUploadFunctions'

export default {
	name: 'AudioPreview',
	props: {
		attachment: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			loading: false,
			error: false,
			isPlaying: false,
			currentTime: 0,
			progress: 0,
			waveformBars: [],
		}
	},
	mounted() {
		this.generateWaveform()
	},
	methods: {
		formatFileSize,
		togglePlay() {
			if (this.error) return

			const audio = this.$refs.audioElement as HTMLAudioElement
			if (audio.paused) {
				audio.play()
				this.isPlaying = true
			} else {
				audio.pause()
				this.isPlaying = false
			}
		},
		onAudioError() {
			this.loading = false
			this.error = true
			this.isPlaying = false
		},
		updateProgress() {
			const audio = this.$refs.audioElement as HTMLAudioElement
			this.currentTime = audio.currentTime
			if (audio.duration) {
				this.progress = (audio.currentTime / audio.duration) * 100
			}
		},
		onAudioEnded() {
			this.isPlaying = false
			this.progress = 0
			this.currentTime = 0
		},
		generateWaveform() {
			// Generate random waveform bars for visual effect
			const barCount = 25 // Reduced from 40 to make it narrower
			this.waveformBars = []
			for (let i = 0; i < barCount; i++) {
				// Create varied heights for a more natural waveform look
				const baseHeight = 5 + Math.random() * 14 // 5-19px (slightly taller)
				this.waveformBars.push(baseHeight)
			}
		},
		seekAudio(event) {
			if (this.error || !this.attachment.duration) return

			const waveformContainer = this.$refs.waveformContainer
			const rect = waveformContainer.getBoundingClientRect()
			const clickX = event.clientX - rect.left
			const percentage = clickX / rect.width

			const audio = this.$refs.audioElement as HTMLAudioElement
			audio.currentTime = percentage * audio.duration
		},
		formatDuration(seconds: number): string {
			const mins = Math.floor(seconds / 60)
			const secs = Math.floor(seconds % 60)
			return `${mins}:${secs.toString().padStart(2, '0')}`
		},
	},
}
</script>
