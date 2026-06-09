<template>
	<div>
		<MediaMessage
			v-bind="$attrs"
			v-model="content.image"
			media-type="image"
			accept-types="image/*"
			accept-text="PNG, JPG, GIF up to 10MB"
			:max-size="10 * 1024 * 1024"
			default-extension="jpg"
		>
			<template #empty-icon>
				<i class="fa fa-image text-3xl text-base-content/40"></i>
			</template>

			<template #media-preview="{ media }">
				<div class="relative inline-block max-w-full">
					<img :src="media.url" :alt="media.name" class="max-w-full max-h-64 rounded-lg shadow-sm" />
				</div>
				<div class="text-xs text-base-content/60 mt-2 text-center">({{ formatFileSize(media.size) }})</div>
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
		// Initialize content.image if it doesn't exist
		this.content.image = this.content.image ?? {
			url: '',
			name: '',
			size: 0,
		}

		return {}
	},
	methods: {
		formatFileSize,
	},
}
</script>
