<template>
	<CustomDropdown ref="dropdownRef" placement="right-end" @show="showDropdown" @apply-hide="applyHideDropdown">
		<slot name="triggerButton">
			<slot>
				<span>{{ title || $t('components.globalComponents.shareDropdown.title') }}</span>
				<i class="fa fa-chevron-down text-xs"></i>
			</slot>
		</slot>
		<template ref="popper" #popper="{ shown, hide }">
			<div class="w-max bg-base-100">
				<ul class="menu" tabindex="0">
					<li>
						<CustomDropdown ref="copyDropdown" placement="right-end" :triggers="[]" :autoHide="true" class="block">
							<a href="javascript:" class="flex items-center gap-2 py-2" @click.stop="openCopyPreview">
								<loading-element :is-loading="isPreviewLoading" size="16">
									<i class="fa fa-copy text-primary" />
								</loading-element>
								<span>{{ $t('components.globalComponents.shareDropdown.copy') }}</span>
								<i class="fa fa-chevron-right ml-auto text-xs opacity-60" />
							</a>
							<template #popper>
								<div class="p-3 w-50 bg-base-100 flex flex-col gap-2" v-auto-animate>
									<div class="bg-base-200 rounded-lg px-3 py-2 text-xs text-muted truncate select-all cursor-text">
										{{ previewUrl }}
									</div>

									<a v-if="!isCopyError || !retryUrl" href="javascript:" @click="copy" class="btn btn-sm btn-primary">
										<loading-element :is-loading="isCopyLoading" size="16">
											<span v-auto-animate class="flex items-center gap-2">
												<i v-if="copied" class="fa fa-check-circle" />
												<i v-else class="fa fa-copy" />
												<span>{{ $t('components.globalComponents.shareDropdown.copy') }}</span>
											</span>
										</loading-element>
									</a>

									<a
										v-else
										href="javascript:"
										@click.stop="retryCopy"
										class="flex items-start gap-2 text-xs bg-warning/30 hover:bg-warning/50 rounded-lg p-2"
									>
										<i v-if="copied" class="fa fa-check-circle text-primary mt-0.5 shrink-0" />
										<i v-else class="fa fa-circle-info mt-0.5 shrink-0" />
										<div class="flex flex-col">
											<span class="font-medium text-base-content">
												{{ $t('components.globalComponents.shareDropdown.retryTitle') }}
											</span>
											<span>{{ $t('components.globalComponents.shareDropdown.retryHint') }}</span>
										</div>
									</a>
								</div>
							</template>
						</CustomDropdown>
					</li>
					<li
						:class="{
							'opacity-50 pointer-events-none': isCreateImageLoading,
						}"
					>
						<a @click="createImage" class="flex items-center gap-2 py-2">
							<loading-element :is-loading="isCreateImageLoading" size="16">
								<!--								<i v-if="isCreateImageError" class="fa fa-rotate" />-->
								<i class="fa fa-image text-success" />
							</loading-element>
							<span>{{ $t('components.globalComponents.shareDropdown.download') }}</span>
						</a>
					</li>
					<li>
						<a
							@click="share"
							class="flex items-center gap-2 py-2"
							:class="{
								'opacity-50 pointer-events-none': isShareLoading,
							}"
						>
							<loading-element :is-loading="isShareLoading" size="16">
								<i class="fa fa-share-alt" />
							</loading-element>
							<span>{{ $t('components.globalComponents.shareDropdown.share') }}</span>
						</a>
					</li>
				</ul>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	name: 'ShareDropdown',
	components: {
		LoadingElement,
		CustomDropdown,
	},
	props: {
		title: {
			type: String,
			default: null,
		},
		url: {
			type: [String, Function],
			default: null,
		},
		downloadFilename: {
			type: String,
			default: 'download',
		},
	},
	setup() {
		return {
			runtimeConfig: useRuntimeConfig(),
		}
	},
	data() {
		return {
			isCopyLoading: false,
			copied: false,
			isCreateImageLoading: false,
			isShareLoading: false,
			shared: false,
			isCreateImageError: false,
			isShareError: false,
			isCopyError: false,
			retryUrl: null,
			previewUrl: null,
			isPreviewLoading: false,
		}
	},
	emits: ['completed', 'show', 'hide'],
	methods: {
		showDropdown() {
			consoleLog('showDropdown')
			this.shared = false

			this.isCopyError = false
			this.isCreateImageError = false
			this.isShareError = false

			this.$emit('show')
		},
		applyHideDropdown() {
			consoleLog('hideDropdown')
			this.$emit('hide', this.shared)
		},
		async getUrl() {
			if (typeof this.url === 'function') {
				return await this.url()
			}
			return this.url
		},
		copy() {
			const url = this.previewUrl
			if (!url) return
			this.isCopyError = false
			this.retryUrl = null
			Promise.resolve(navigator.clipboard?.writeText(url))
				.then(() => {
					this.copied = true
					this.completed('copy')
					setTimeout(() => {
						this.copied = false
					}, 500)
					setTimeout(() => {
						this.$refs.copyDropdown?.hide()
					}, 700)
				})
				.catch(() => {
					this.isCopyError = true
					this.retryUrl = url
				})
		},
		async createImage() {
			if (this.isCreateImageLoading) return
			this.isCreateImageLoading = true
			this.isCreateImageError = false
			const url = await this.getUrl().catch((err) => {
				this.isCreateImageLoading = false
				this.isCreateImageError = true
			})
			if (!url) return
			const apiUrl = this.runtimeConfig.public.createUrl
			const mergedDomain = this.$mergeDomainNPath(apiUrl, 'v')

			this.$requestAdapter
				.post(
					mergedDomain,
					{
						url: url ?? '',
						width: 450,
						height: 'auto',
						selector: '#sizeRef',
						heightMargin: 170,
					},
					{
						responseType: 'blob',
					},
				)
				.then((response) => {
					if (!response) return

					const downloadUrl = window.URL.createObjectURL(response)
					const link = document.createElement('a')
					link.download = this.downloadFilename + '.png'
					link.href = downloadUrl
					link.click()

					window.URL.revokeObjectURL(downloadUrl)
					this.completed('download')
				})
				.catch((error) => {
					consoleLog(error)
					this.isCreateImageError = true
					// this.error("download", error)
				})
				.finally(() => {
					this.isCreateImageLoading = false
					// this.completed('download')
				})
		},
		async share() {
			this.isShareLoading = true
			this.isShareError = false
			const url = await this.getUrl().catch((err) => {
				this.isShareLoading = false
				this.isShareError = true
			})
			if (!url) return

			if (!url || !navigator.share) {
				this.$emit('share')
				this.isShareLoading = false
				return
			}
			await navigator
				.share({
					title: this.title || this.$t('components.globalComponents.shareDropdown.share'),
					url: url,
				})
				.catch((err) => {
					consoleLog(err)
					this.isShareError = true
				})
				.finally(() => {
					this.isShareLoading = false
				})
			this.completed('share')
		},
		openCopyPreview() {
			if (this.isPreviewLoading) return
			if (this.previewUrl) {
				this.$refs.copyDropdown?.show()
				return
			}
			this.isPreviewLoading = true
			this.getUrl()
				.then((url) => {
					this.previewUrl = url
					if (url) this.$refs.copyDropdown?.show()
				})
				.catch(() => {})
				.finally(() => {
					this.isPreviewLoading = false
				})
		},
		retryCopy() {
			if (!this.retryUrl) return
			Promise.resolve(navigator.clipboard?.writeText(this.retryUrl))
				.then(() => {
					this.copied = true
					this.isCopyError = false
					setTimeout(() => {
						this.copied = false
					}, 1000)
					this.completed('copy')
				})
				.catch(() => {})
		},
		completed(action) {
			this.shared = true
			this.$emit('completed', action)
		},
		// error(action, error) {
		// 	this.$emit('error', { action, error })
		// },
		// handleCopy() {
		// 	this.isLoading = true
		// 	this.getUrl()
		// 		.then((url) => {
		// 			if (url) {
		// 				return navigator.clipboard?.writeText(url)
		// 			}
		// 			this.$emit('copy')
		// 		})
		// 		.then(() => {
		// 			this.$emit('completed', 'copy')
		// 		})
		// 		.catch((error) => {
		// 			consoleLog(error)
		// 			this.$emit('error', { action: 'copy', error })
		// 			this.$emit('copy')
		// 		})
		// 		.finally(() => {
		// 			this.isLoading = false
		// 		})
		// },
		// handleDownload() {
		// 	if (!this.useInternalDownload && !this.urlFunction) {
		// 		this.$emit('download')
		// 		return
		// 	}
		// 	this.downloadImage()
		// },
		// downloadImage() {
		// 	this.isLoading = true
		//
		// 	this.getUrl()
		// 		.then((url) => {
		// 			if (!url) {
		// 				this.isLoading = false
		// 				return
		// 			}
		//
		// 			const apiUrl = this.runtimeConfig.public.createUrl
		// 			const mergedDomain = this.$mergeDomainNPath(apiUrl, 'v')
		//
		// 			return this.$requestAdapter.post(
		// 				mergedDomain,
		// 				{
		// 					url: url,
		// 					width: 360,
		// 					height: 640,
		// 				},
		// 				{
		// 					responseType: 'blob',
		// 				},
		// 			)
		// 		})
		// 		.then((response) => {
		// 			if (!response) return
		//
		// 			const downloadUrl = window.URL.createObjectURL(response)
		// 			const link = document.createElement('a')
		// 			link.download = this.downloadFilename + '.png'
		// 			link.href = downloadUrl
		// 			link.click()
		//
		// 			window.URL.revokeObjectURL(downloadUrl)
		// 			this.$emit('completed', 'download')
		// 		})
		// 		.catch((error) => {
		// 			consoleLog(error)
		// 			this.$emit('error', { action: 'download', error })
		// 		})
		// 		.finally(() => {
		// 			this.isLoading = false
		// 		})
		// },
		// handleShare() {
		// 	this.isLoading = true
		// 	this.getUrl()
		// 		.then((url) => {
		// 			if (!url || !navigator.share) {
		// 				this.$emit('share')
		// 				return
		// 			}
		// 			return navigator.share({
		// 				title: this.title || 'Paylaş',
		// 				url: url,
		// 			})
		// 		})
		// 		.then(() => {
		// 			this.$emit('completed', 'share')
		// 		})
		// 		.catch((error) => {
		// 			consoleLog(error)
		// 			this.$emit('error', { action: 'share', error })
		// 		})
		// 		.finally(() => {
		// 			this.isLoading = false
		// 		})
		// },
	},
}
</script>
