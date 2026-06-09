<template>
	<div>
		<div
			v-bind="$attrs"
			@drop="handleDrop"
			@dragover.prevent
			@dragenter.prevent
			class="border-2 border-dashed border-base-300 rounded-lg text-center hover:border-primary hover:bg-base-300/50 transition-colors cursor-pointer bg-base-300"
			:class="{
				'border-primary bg-base-300/50': isDragging,
				'pointer-events-none': loading,
			}"
			@click="handleClick"
		>
			<div v-if="!mediaData.url" class="py-6">
				<loadingElement :isLoading="loading" size="24">
					<slot name="empty-icon">
						<i class="fa fa-file text-3xl text-base-content/40" />
					</slot>
				</loadingElement>
				<div>
					<slot name="empty-text">
						<p class="text-sm font-medium">
							{{ $t('components.flow.node.actions.sendMessagePartials.mediaMessage.dropFileHere') }}
						</p>
						<p class="text-xs text-base-content/60">{{ acceptText }}</p>
					</slot>
				</div>

				<div class="text-center mt-3">
					<CustomDropdown ref="dropdown" placement="top">
						<button class="btn btn-link btn-sm text-primary" @click.stop>
							<i class="fa fa-link mr-1" />
							{{ $t('components.flow.node.actions.sendMessagePartials.mediaMessage.orEnterUrl') }}
						</button>
						<template #popper>
							<div class="dropdown-content card card-compact w-80 p-3 shadow bg-base-100 border border-base-300">
								<div class="space-y-3">
									<h4 class="font-medium text-sm">
										{{
											$t('components.flow.node.actions.sendMessagePartials.mediaMessage.enterMediaUrl', {
												mediaType: $t(
													'components.flow.node.actions.sendMessagePartials.mediaMessage.mediaTypes.' + mediaType,
												),
											})
										}}
									</h4>
									<div class="relative">
										<input
											v-model="tempUrl"
											type="url"
											:placeholder="`https://example.com/${mediaType}.${defaultExtension}`"
											class="input input-bordered input-sm w-full pr-12"
											@keyup.enter="loadMediaFromUrl"
											ref="urlInput"
										/>
										<button
											@click="pasteFromClipboard"
											class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost z-10"
											:title="$t('components.flow.node.actions.sendMessagePartials.mediaMessage.pasteFromClipboard')"
										>
											<i class="fa fa-paste text-sm"></i>
										</button>
									</div>
									<div class="flex gap-2 justify-end">
										<button @click="cancelUrlInput" class="btn btn-sm btn-ghost">
											{{ $t('components.flow.node.actions.sendMessagePartials.mediaMessage.cancel') }}
										</button>
										<button @click="loadMediaFromUrl" class="btn btn-sm btn-primary" :disabled="!tempUrl">
											{{
												$t('components.flow.node.actions.sendMessagePartials.mediaMessage.loadMedia', {
													mediaType: $t(
														'components.flow.node.actions.sendMessagePartials.mediaMessage.mediaTypes.' + mediaType,
													),
												})
											}}
										</button>
									</div>
								</div>
							</div>
						</template>
					</CustomDropdown>
				</div>

				<!-- Extra Slot for Additional Actions (like Record button) -->
				<slot name="extra-actions" />
			</div>
			<div v-else class="relative" :class="{ 'opacity-50': loading }">
				<loadingElement
					class="absolute z-1 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
					:isLoading="loading"
					size="24"
				/>

				<slot name="media-preview" :media="mediaData">
					<div class="p-4">
						<i class="fa fa-file text-2xl text-primary"></i>
						<div class="text-sm mt-2">{{ mediaData.name }}</div>
					</div>
				</slot>
				<button @click.stop="removeMedia" class="absolute top-2 right-2 btn btn-sm btn-circle btn-error">
					<i class="fa fa-times" />
				</button>
			</div>
		</div>

		<input ref="fileInput" type="file" :accept="filteredAcceptTypes" @change="handleFileSelect" class="hidden" />
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { formatFileSize } from '~/helpers/fileUploadFunctions.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown, LoadingElement },
	props: {
		modelValue: {
			type: Object,
			default: () => ({
				url: '',
				name: '',
				size: 0,
				duration: 0,
			}),
		},
		mediaType: {
			type: String,
			required: true, // 'image', 'audio', 'video'
		},
		acceptTypes: {
			type: String,
			required: true, // 'image/*', 'audio/*', 'video/*'
		},
		acceptText: {
			type: String,
			required: true, // 'PNG, JPG, GIF up to 10MB'
		},
		maxSize: {
			type: Number,
			default: 10 * 1024 * 1024, // 10MB default
		},
		defaultExtension: {
			type: String,
			default: 'mp4',
		},
	},
	emits: ['update:modelValue', 'remove'],
	data() {
		return {
			isDragging: false,
			tempUrl: '',
			loading: false,
		}
	},
	computed: {
		messageData: {
			get() {
				return this.modelValue
			},
			set(value) {
				this.$emit('update:modelValue', value)
			},
		},
		mediaData: {
			get() {
				return {
					url: this.messageData.url || '',
					name: this.messageData.name || '',
					size: this.messageData.size || 0,
					duration: this.messageData.duration || 0,
				}
			},
			set(value) {
				this.messageData = {
					...this.messageData,
					url: value.url,
					name: value.name,
					size: value.size,
					duration: value.duration || 0,
				}
			},
		},
		filteredAcceptTypes() {
			// Video için sadece desteklenen formatları göster
			if (this.mediaType === 'video') {
				return 'video/mp4,video/webm,video/ogg'
			}
			return this.acceptTypes
		},
	},
	methods: {
		formatFileSize,
		handleClick() {
			if (!this.loading) {
				this.$refs.fileInput.click()
			}
		},
		handleDrop(event) {
			event.preventDefault()
			this.isDragging = false

			const files = event.dataTransfer.files
			if (files.length > 0) {
				this.processFile(files[0])
			}
		},
		handleFileSelect(event) {
			const files = event.target.files
			if (files.length > 0) {
				this.processFile(files[0])
			}
		},
		async processFile(file) {
			if (this.mediaType !== 'file' && !file.type.startsWith(this.mediaType + '/')) {
				alert(
					this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.pleaseSelectFile', {
						mediaType: this.$t(
							'components.flow.node.actions.sendMessagePartials.mediaMessage.mediaTypes.' + this.mediaType,
						),
					}),
				)
				return
			}

			// Check for unsupported video formats
			if (this.mediaType === 'video') {
				const unsupportedFormats = ['.mov', '.avi', '.wmv', '.flv']
				const fileName = file.name.toLowerCase()
				const isUnsupported = unsupportedFormats.some((format) => fileName.endsWith(format))

				if (isUnsupported) {
					alert(
						this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.formatNotSupported', {
							format: file.name.split('.').pop().toUpperCase(),
						}),
					)
					return
				}
			}

			if (file.size > this.maxSize) {
				const sizeMB = Math.round(this.maxSize / (1024 * 1024))
				alert(
					this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.fileSizeTooLarge', { size: sizeMB }),
				)
				return
			}

			this.loading = true
			// Execute upload with error handling
			this.uploadFile(file)
				.catch((error) => {
					console.error('Upload error:', error)
					alert(error.message || this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.uploadFailed'))
				})
				.finally(() => {
					console.log('Upload process completed')
					this.loading = false
				})
		},
		async uploadFile(file) {
			// 1. Backend'den pre-signed URL al
			const response = await this.$requestAdapter.post(apiList.uploadFile, {
				fileName: file.name,
				fileType: file.type,
			})
			if (!response?.success && !response?.data) {
				console.error('Response:', response)
				throw new Error(this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.failedToGetUploadUrl'))
			}

			const { url: preSignedUrl, cloud_url: cloudUrl } = response.data || response

			// 2. Pre-signed URL'e dosyayı yükle
			const uploadResponse = await fetch(preSignedUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			})

			if (!uploadResponse.ok) {
				throw new Error(this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.fileUploadFailed'))
			}

			// 3. Cloud URL'i kaydet ve preview için local URL oluştur
			const reader = new FileReader()
			reader.onload = (e) => {
				if (this.mediaType === 'audio') {
					// Get audio duration
					const audio = new Audio()
					audio.onloadedmetadata = () => {
						this.mediaData = {
							url: cloudUrl,
							previewUrl: e.target.result,
							name: file.name,
							size: file.size,
							duration: audio.duration,
						}
					}
					audio.onerror = () => {
						// Fallback if metadata loading fails
						this.mediaData = {
							url: cloudUrl,
							previewUrl: e.target.result,
							name: file.name,
							size: file.size,
							duration: 0,
						}
					}
					audio.src = e.target.result

					// Fallback timeout in case metadata doesn't load
					setTimeout(() => {
						if (!this.mediaData.url) {
							this.mediaData = {
								url: cloudUrl,
								previewUrl: e.target.result,
								name: file.name,
								size: file.size,
								duration: 0,
							}
						}
					}, 1000)
				} else if (this.mediaType === 'video') {
					// Immediately set the video data for preview
					this.mediaData = {
						url: cloudUrl,
						previewUrl: e.target.result,
						name: file.name,
						size: file.size,
						duration: 0,
					}

					// Try to get video duration (optional)
					const video = document.createElement('video')
					video.onloadedmetadata = () => {
						// Update duration if metadata loads successfully
						this.mediaData = {
							...this.mediaData,
							duration: video.duration || 0,
						}
					}
					video.onerror = () => {
						// Duration stays 0, but preview is already shown
						console.warn('Could not load video metadata for duration')
					}
					// Set video source to try loading metadata
					video.src = e.target.result
				} else {
					// Image or other media
					this.mediaData = {
						url: cloudUrl,
						previewUrl: e.target.result,
						name: file.name,
						size: file.size,
						duration: 0,
					}
				}
				this.tempUrl = '' // Clear temp URL when file is uploaded
			}
			reader.readAsDataURL(file)
		},
		loadMediaFromUrl() {
			if (this.tempUrl) {
				this.mediaData = {
					url: this.tempUrl,
					name: this.$t('components.flow.node.actions.sendMessagePartials.mediaMessage.externalMedia', {
						mediaType: this.$t(
							'components.flow.node.actions.sendMessagePartials.mediaMessage.mediaTypes.' + this.mediaType,
						),
					}),
					size: 0,
					duration: 0,
				}
				this.cancelUrlInput()
				// Clear file input when URL is loaded
				this.$refs.fileInput.value = ''
				// Close dropdown
				this.$refs.dropdown.hide()
			}
		},
		cancelUrlInput() {
			this.tempUrl = ''
			// Close dropdown
			this.$refs.dropdown.hide()
		},
		async pasteFromClipboard() {
			try {
				const text = await navigator.clipboard.readText()
				if (text) {
					this.tempUrl = text.trim()
				}
			} catch (err) {
				console.warn('Clipboard access denied or not supported')
				// Fallback: Focus input for manual paste
				if (this.$refs.urlInput) {
					this.$refs.urlInput.focus()
				}
			}
		},
		removeMedia() {
			this.mediaData = {
				url: '',
				name: '',
				size: 0,
				duration: 0,
			}
			this.tempUrl = ''
			this.$refs.fileInput.value = ''
		},
		formatDuration(seconds) {
			if (!seconds) return '0:00'
			const mins = Math.floor(seconds / 60)
			const secs = Math.floor(seconds % 60)
			return `${mins}:${secs.toString().padStart(2, '0')}`
		},
	},
}
</script>
