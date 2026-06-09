<template>
	<MediaMessage
		v-model="content.audio"
		media-type="audio"
		accept-types="audio/*"
		:accept-text="$t('components.flow.node.actions.sendMessagePartials.audioMessage.acceptText')"
		:max-size="MAX_AUDIO_SIZE"
		default-extension="mp3"
	>
		<template #empty-icon>
			<i class="fa fa-music text-3xl text-base-content/40"></i>
		</template>

		<template #media-preview="{ media }">
			<div class="p-4 space-y-3">
				<div class="flex items-center justify-center gap-3">
					<i class="fa fa-file-audio text-2xl text-primary"></i>
					<div class="text-left">
						<!--						<div class="font-medium">{{ media.name }}</div>-->
						<div class="text-xs text-base-content/60">
							{{ formatFileSize(media.size) }} • {{ formatTime(media.duration) }}
						</div>
					</div>
				</div>

				<!-- Audio Player -->
				<audio v-if="media.url" controls class="w-full">
					<source :src="media.url" />
					{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.browserNotSupported') }}
				</audio>
			</div>
		</template>

		<template #extra-actions>
			<div class="text-center mt-3">
				<CustomDropdown ref="recordingDropdown" placement="top" container="#appPage" @click.stop>
					<button class="btn btn-link btn-sm text-primary">
						<i class="fa fa-microphone mr-1" />
						{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.orRecordAudio') }}
					</button>

					<template #popper>
						<div class="w-80 p-4">
							<AudioRecorder @audioData="handleAudioData" />
						</div>
					</template>
				</CustomDropdown>
			</div>
		</template>
	</MediaMessage>
</template>

<script>
import MediaMessage from './MediaMessage.vue'
import AudioRecorder from './AudioRecorder.vue'
import { formatFileSize, formatTime, MAX_AUDIO_SIZE } from '~/helpers/fileUploadFunctions.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
		MediaMessage,
		AudioRecorder,
	},
	props: {
		content: {
			type: Object,
			required: true,
		},
	},
	data() {
		// Initialize content.audio if it doesn't exist
		this.content.audio = this.content.audio ?? {
			url: '',
			name: '',
			size: 0,
			duration: 0,
		}
		return {
			MAX_AUDIO_SIZE,
		}
	},
	methods: {
		formatFileSize,
		formatTime,
		handleAudioData(audioData) {
			this.content.audio = {
				...this.content.audio,
				url: audioData.cloudUrl,
				name: audioData.fileName,
				size: audioData.fileSize,
				duration: 0,
			}

			// Dropdown'ı kapat
			this.$refs.recordingDropdown.hide()
		},
	},
}
</script>
