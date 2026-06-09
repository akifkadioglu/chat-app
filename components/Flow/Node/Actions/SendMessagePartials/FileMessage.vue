<template>
	<MediaMessage
		v-model="content.file"
		media-type="file"
		accept-types="application/pdf"
		:accept-text="$t('components.flow.node.actions.sendMessagePartials.fileMessage.acceptText')"
		:max-size="MAX_FILE_SIZE"
		default-extension="pdf"
	>
		<template #empty-icon>
			<i class="fa fa-file-pdf text-3xl text-base-content/40"></i>
		</template>

		<template #media-preview="{ media }">
			<div class="p-4">
				<div class="flex items-center justify-center gap-3">
					<i class="fa fa-file-pdf text-2xl text-primary"/>
					<div class="text-left">
						<div class="font-medium truncate max-w-48">{{ media.name }}</div>
						<div class="text-xs text-base-content/60">
							{{ formatFileSize(media.size) }}
						</div>
					</div>
				</div>
			</div>
		</template>
	</MediaMessage>
</template>

<script>
import MediaMessage from './MediaMessage.vue'
import { formatFileSize, MAX_FILE_SIZE } from '~/helpers/fileUploadFunctions.js'

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
		this.content.file = this.content.file ?? {
			url: '',
			name: '',
			size: 0,
		}
		return {
			MAX_FILE_SIZE,
		}
	},
	methods: {
		formatFileSize,
	},
}
</script>
