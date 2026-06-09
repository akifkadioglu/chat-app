<template>
	<div class="relative w-full h-full">
		<!-- Image First -->
		<img
			v-if="!imageError && !videoLoaded"
			:src="src"
			:class="imageClass"
			@error="onImageError"
			@load="onImageLoad"
			:alt="alt"
		/>

		<!-- Video Fallback -->
		<video
			v-if="(imageError || videoLoaded) && !videoError"
			ref="videoElement"
			:src="src"
			:class="videoClass"
			muted
			loop
			@error="onVideoError"
			@loadeddata="onVideoLoad"
			@click="toggleVideoPlay"
		/>

		<!-- Error State -->
		<div v-if="videoError && imageError" class="absolute inset-0 flex items-center justify-center">
			<i class="fa fa-image text-secondary text-4xl" />
		</div>

		<!-- Media Type Icon -->
		<div
			v-if="!videoError || !imageError"
			class="absolute top-1 right-1 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center backdrop-blur-sm"
		>
			<i
				v-if="(imageError || videoLoaded) && !videoError"
				class="fa fa-play text-white text-xs"
			/>
			<i
				v-else-if="!imageError"
				class="fa fa-image text-white text-xs"
			/>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ImageVideoPreview',
	props: {
		src: {
			type: String,
			required: true,
		},
		alt: {
			type: String,
			default: '',
		},
		videoClass: {
			type: String,
			default: 'object-cover w-full h-full rounded-2xl cursor-pointer',
		},
		imageClass: {
			type: String,
			default: 'object-cover w-full h-full rounded-2xl',
		},
	},
	data() {
		return {
			imageError: false,
			videoError: false,
			videoLoaded: false,
		}
	},
	methods: {
		onImageLoad() {
			// Image başarıyla yüklendi
		},
		onImageError() {
			this.imageError = true
			// Image yüklenemedi, video deneyelim
		},
		onVideoLoad() {
			this.videoLoaded = true
		},
		onVideoError() {
			this.videoError = true
		},
		toggleVideoPlay(event) {
			const video = event.target
			if (video.paused) {
				video.play()
			} else {
				video.pause()
			}
		},
	},
}
</script>
