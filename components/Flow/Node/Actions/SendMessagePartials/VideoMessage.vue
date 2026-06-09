<template>
	<div>
		<MediaMessage
			v-model="content.video"
			media-type="video"
			accept-types="video/*"
			:accept-text="$t('components.flow.node.actions.sendMessagePartials.videoMessage.acceptText')"
			:max-size="100 * 1024 * 1024"
			default-extension="mp4"
		>
			<template #empty-icon>
				<i class="fa fa-video text-3xl text-base-content/40"></i>
			</template>

			<template #media-preview="{ media }">
				<div class="relative inline-block max-w-full">
					<video :src="media.url" controls class="max-w-full max-h-48 rounded-lg shadow-sm" preload="metadata">
						{{ $t('components.flow.node.actions.sendMessagePartials.videoMessage.browserNotSupported') }}
					</video>
				</div>
				<div class="text-xs text-base-content/60 mt-2 text-center truncate">
					({{ formatFileSize(media.size) }})
					<span v-if="media.duration"> • {{ formatDuration(media.duration) }}</span>
				</div>
			</template>
		</MediaMessage>
	</div>
</template>

<script>
import MediaMessage from './MediaMessage.vue'
import { formatFileSize } from '~/helpers/fileUploadFunctions.js'

export default {
	components: {
		MediaMessage,
	},
	props: {
		content: {
			type: Object,
			required: true,
		},
	},
	data() {
		// Initialize content.video if it doesn't exist
		this.content.video = this.content.video ?? {
			url: '',
			name: '',
			size: 0,
			duration: 0,
		}

		return {}
	},
	computed: {},
	methods: {
		formatFileSize,
		formatDuration(seconds) {
			if (!seconds) return '0:00'
			const mins = Math.floor(seconds / 60)
			const secs = Math.floor(seconds % 60)
			return `${mins}:${secs.toString().padStart(2, '0')}`
		},
	},
}
</script>
