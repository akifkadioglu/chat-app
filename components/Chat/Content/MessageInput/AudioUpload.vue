<template>
	<li>
		<CustomDropdown ref="dropdown">
			<button class="btn btn-ghost" :class="{ 'btn-primary': audioData?.length > 0 }" :disabled="disabled">
				<i class="fa fa-microphone" />
			</button>
			<template #popper>
				<div class="card card-compact w-80 p-4 bg-base-100">
					<div class="text-center space-y-4">
						<!-- File Upload Option -->
						<div class="space-y-3">
							<input ref="audioInput" type="file" accept="audio/*" @change="handleAudioSelect" class="hidden" />
							<button @click.stop="$refs.audioInput.click()" :disabled="isSaving" class="btn btn-outline btn-sm w-full">
								<LoadingElement :isLoading="isSaving">
									<i class="fa fa-upload" />
								</LoadingElement>
								{{ $t('components.chat.content.messageInput.AudioUpload.uploadAudio') }}
							</button>
						</div>

						<div class="divider">VEYA</div>
						<AudioRecorder @audioData="handleAudioData" />
					</div>
				</div>
			</template>
		</CustomDropdown>
	</li>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import AudioRecorder from '~/components/Flow/Node/Actions/SendMessagePartials/AudioRecorder.vue'
import { processAudioFile } from '~/helpers/fileUploadFunctions.js'

export default {
	components: { AudioRecorder, LoadingElement, CustomDropdown },
	props: {
		modelValue: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue', 'uploaded'],
	data() {
		return {
			audioData: {},
			isSaving: false,
		}
	},
	watch: {
		audioData: {
			deep: true,
			handler(newValue) {
				this.$emit('update:modelValue', newValue)
			},
		},
	},
	methods: {
		async handleAudioSelect(event) {
			const file = event.target.files[0]
			if (!file) return

			this.isSaving = true

			this.audioData = await processAudioFile(file, this.$requestAdapter)

			this.isSaving = false
			event.target.value = ''
			this.$refs.dropdown.hide()
		},
		handleAudioData(audioData) {
			this.audioData = audioData
			this.$refs.dropdown.hide()
		},
	},
}
</script>

<style scoped></style>
