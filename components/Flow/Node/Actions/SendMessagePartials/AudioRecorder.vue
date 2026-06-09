<template>
	<div class="card card-compact bg-base-100">
		<div class="text-center space-y-4">
			<div v-if="!isRecording && !recordedAudio" class="space-y-3">
				<i class="fa fa-microphone text-4xl text-base-content/40" />
				<p class="text-sm">
					{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.clickToStartRecording') }}
				</p>
				<button @click="startRecording" class="btn btn-primary btn-circle btn-lg">
					<i class="fa fa-microphone text-xl" />
				</button>
			</div>

			<div v-else-if="isRecording" class="space-y-3">
				<div class="relative">
					<i class="fa fa-microphone text-4xl text-error animate-pulse" />
					<div class="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-ping" />
				</div>
				<p class="text-sm font-medium text-error">
					{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.recording') }}
					{{ formatTime(recordingTime) }}
				</p>
				<div class="flex gap-2 justify-center">
					<button @click="stopRecording" class="btn btn-error btn-circle">
						<i class="fa fa-stop" />
					</button>
					<button @click="cancelRecording" class="btn btn-ghost btn-circle">
						<i class="fa fa-times" />
					</button>
				</div>
			</div>

			<div v-else-if="recordedAudio" class="space-y-3">
				<i class="fa fa-check-circle text-4xl text-success" />
				<p class="text-sm font-medium">
					{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.recordingCompleted') }} ({{
						formatTime(recordingTime)
					}})
				</p>

				<audio controls class="w-full">
					<source :src="recordedAudio" />
				</audio>

				<div class="flex gap-2 justify-center">
					<button :disabled="isSaving" @click="saveRecording" class="btn btn-success">
						<span class="mr-1">
							<LoadingElement :isLoading="isSaving">
								<i class="fa fa-check" />
							</LoadingElement>
						</span>
						{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.useRecording') }}
					</button>
					<button @click="discardRecording" class="btn btn-ghost">
						<i class="fa fa-trash mr-1" />
						{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.discard') }}
					</button>
				</div>
			</div>

			<!-- Recording Status -->
			<div v-if="!microphonePermission" class="alert alert-warning">
				<i class="fa fa-exclamation-triangle" />
				<div>
					<div class="font-medium">
						{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.microphonePermissionRequired') }}
					</div>
					<div class="text-sm">
						{{ $t('components.flow.node.actions.sendMessagePartials.audioMessage.allowMicrophoneAccess') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { uploadFile } from '~/helpers/fileUploadFunctions.js'

export default {
	components: { LoadingElement },
	data() {
		return {
			isRecording: false,
			isSaving: false,
			recordedAudio: null,
			recordingTime: 0,
			mediaRecorder: null,
			audioChunks: [],
			recordingInterval: null,
			microphonePermission: true,
			showPermissionWarning: false,
		}
	},
	methods: {
		uploadFile,
		async startRecording() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
				this.microphonePermission = true

				this.mediaRecorder = new MediaRecorder(stream)
				const chunks = []

				this.mediaRecorder.ondataavailable = (event) => {
					chunks.push(event.data)
				}

				this.mediaRecorder.onstop = () => {
					const blob = new Blob(chunks, { type: 'audio/wav' })
					this.recordedAudio = URL.createObjectURL(blob)
					stream.getTracks().forEach((track) => track.stop())
				}

				this.mediaRecorder.start()
				this.isRecording = true
				this.recordingTime = 0

				this.recordingTimer = setInterval(() => {
					this.recordingTime++
				}, 1000)
			} catch (error) {
				this.microphonePermission = false
			}
		},
		stopRecording() {
			if (this.mediaRecorder && this.isRecording) {
				this.mediaRecorder.stop()
				this.isRecording = false
				clearInterval(this.recordingTimer)
			}
		},
		cancelRecording() {
			if (this.mediaRecorder && this.isRecording) {
				this.mediaRecorder.stop()
				this.isRecording = false
				this.recordingTime = 0
				this.recordedAudio = null
				clearInterval(this.recordingTimer)
			}
		},
		saveRecording() {
			if (this.recordedAudio) {
				this.isSaving = true
				fetch(this.recordedAudio)
					.then((response) => response.blob())
					.then((audioBlob) => {
						// Blob'un gerçek tipini al
						const blobType = audioBlob.type || 'audio/mp4'
						const fileExtension = blobType.includes('mp4') ? 'mp4' : blobType.includes('webm') ? 'webm' : 'wav'

						// Create file from blob
						const audioFile = new File([audioBlob], `recording-${Date.now()}.${fileExtension}`, {
							type: blobType,
						})

						return this.processAudioFile(audioFile)
					})
					.then((res) => {
						// Reset recording state
						this.recordedAudio = null
						this.recordingTime = 0
						this.audioChunks = []
						this.$emit('audioData', res)
					})
					.catch((error) => {
						console.error('Save recording error:', error)
					})
					.finally(() => {
						this.isSaving = false
					})
			}
		},
		discardRecording() {
			this.recordedAudio = null
			this.recordingTime = 0
		},
		formatTime(seconds) {
			const mins = Math.floor(seconds / 60)
			const secs = seconds % 60
			return `${mins}:${secs.toString().padStart(2, '0')}`
		},
		async processAudioFile(file) {
			const audioData = {
				file: file,
				fileName: file.name,
				fileSize: file.size,
				uploading: true,
				cloudUrl: null,
				error: null,
				type: 'file',
			}

			// Upload işlemini başlat
			const uploadResult = await this.uploadFile(file, this.$requestAdapter)
			consoleLog('uploadResult', uploadResult)
			audioData.uploading = false

			if (uploadResult.success) {
				audioData.cloudUrl = uploadResult.cloudUrl
				audioData.error = null
			}
			if (!uploadResult.success) {
				audioData.error = uploadResult.error
			}

			return audioData
		},
	},
}
</script>

<style scoped></style>
