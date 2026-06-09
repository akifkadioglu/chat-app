<template>
	<CustomDropdown ref="previewDropdown" :triggers="[]">
		<button :class="buttonClass" :disabled="saving" @click="openPreview">
			<LoadingElement :isLoading="saving" size="16">
				<i class="fa-solid fa-mobile-screen-button" />
			</LoadingElement>
			<span class="text-xs" :class="{ 'hidden sm:block': compactOnMobile }">{{
				$t('components.flow.flowSetup.contentHeader.previewFlow.button')
			}}</span>
		</button>
		<template #popper>
			<div class="p-5 space-y-4 w-80 max-w-dvw">
				<div class="h4 mb-1">
					{{ $t('components.flow.flowSetup.contentHeader.previewFlow.title') }}
				</div>
				<div v-if="qrCode" class="flex flex-col items-center">
					<img :src="qrCode" alt="QR Code" class="w-36 h-36 rounded-lg" />
					<p class="text-xs text-muted mt-1">
						{{ $t('components.flow.flowSetup.contentHeader.previewFlow.scanQr') }}
					</p>
				</div>
				<div>
					<i18n-t
						tag="p"
						keypath="components.flow.flowSetup.contentHeader.previewFlow.description"
						class="text-xs text-muted"
					>
						<template #username>
							<b>
								{{ flowStore.flow.chatAccount.postAccount.username }}
							</b>
						</template>
						<template #code>
							<b class="text-instagram">
								{{ previewCode }}
							</b>
						</template>
					</i18n-t>
				</div>
				<div class="flex flex-col items-start justify-start gap-2 mt-2 md:mt-0 text-center">
					<CopyToClipboard
						v-if="previewCode"
						:copyText="previewCode"
						class="bg-primary/20 border p-2 rounded-lg text-base border-primary w-fit"
					>
						<div class="truncate">
							{{ previewCode }}
						</div>
					</CopyToClipboard>
					<div class="my-5 flex flex-col items-start justify-start gap-2">
						<a
							:href="'https://ig.me/m/' + flowStore.flow.chatAccount.postAccount.username"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<i class="fa-brands fa-instagram text-instagram" />
							{{ $t('components.flow.flowSetup.contentHeader.previewFlow.sendDm') }}
							<i class="fa fa-external-link link-icon" />
						</a>

						<a
							v-if="hasCommentOnPost && postPermalink"
							:href="postPermalink"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<i class="fa-brands fa-instagram text-instagram" />
							{{ $t('components.flow.flowSetup.contentHeader.previewFlow.goToPost') }}
							<i class="fa fa-external-link link-icon" />
						</a>
					</div>

					<div class="alert alert-info alert-soft rounded-lg">
						<div>
							<i class="fa fa-info-circle" />
							<i18n-t
								tag="span"
								keypath="components.flow.flowSetup.contentHeader.previewFlow.commentTestHint"
								class="text-xs text-start"
							>
								<template #username>
									<b>{{ flowStore.flow.chatAccount.postAccount.username }}</b>
								</template>
							</i18n-t>
						</div>
					</div>
				</div>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import QRCode from 'qrcode'
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

function generateQRCodeWithLogo(text, logoSrc) {
	const canvas = document.createElement('canvas')

	return QRCode.toCanvas(canvas, text, {
		errorCorrectionLevel: 'H',
		margin: 2,
		width: 400,
		color: {
			dark: '#000000',
			light: '#FFFFFF',
		},
	}).then(() => {
		return new Promise((resolve) => {
			const ctx = canvas.getContext('2d')
			const logo = new Image()
			logo.onload = () => {
				const logoSize = canvas.width * 0.25
				const x = (canvas.width - logoSize) / 2
				const y = (canvas.height - logoSize) / 2
				const padding = 4
				const radius = 8

				ctx.beginPath()
				ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, radius)
				ctx.fillStyle = '#FFFFFF'
				ctx.fill()

				ctx.drawImage(logo, x, y, logoSize, logoSize)
				resolve(canvas.toDataURL())
			}
			logo.src = logoSrc
		})
	})
}

export default {
	components: {
		LoadingElement,
		CustomDropdown,
		CopyToClipboard,
	},
	props: {
		buttonClass: {
			type: String,
			default: 'btn btn-sm btn-ghost',
		},
		location: {
			type: String,
			default: 'header',
		},
		compactOnMobile: {
			type: Boolean,
			default: false,
		},
	},
	inject: ['saving'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			triggerTypes,
			qrCode: '',
		}
	},
	mounted() {
		this.$emitter.on('openPreviewDropdown', this.showPreview)
	},
	beforeUnmount() {
		this.$emitter.off('openPreviewDropdown', this.showPreview)
	},
	methods: {
		openPreview() {
			// if (this.flowStore.flow.version) {
			// 	this.showPreview(this.location)
			// 	return
			// }

			this.$emitter.emit('saveForPreviewDropdown', this.location)
		},
		showPreview(location) {
			consoleLog("showPreview'in çağırıldığı yer: ", this.location)
			consoleLog("PreviewFlowDropdown'un bulunduğu yer: ", location)
			if (this.location !== location) return
			this.generateQrCode()
			this.$refs.previewDropdown.show()
		},
		generateQrCode() {
			const username = this.flowStore.flow?.chatAccount?.postAccount?.username
			if (!username) return
			generateQRCodeWithLogo('https://ig.me/m/' + username, '/icon.svg').then((dataUrl) => {
				this.qrCode = dataUrl
			})
		},
	},
	computed: {
		previewCode() {
			return this.flowStore.flow?.previewCode || ''
		},
		triggers() {
			const triggerNode = this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.trigger.key)
			return triggerNode?.triggers || []
		},
		commentOnPostTrigger() {
			return this.triggers.find((t) => t.type.key === triggerTypes.commentOnPost.key)
		},
		hasCommentOnPost() {
			return !!this.commentOnPostTrigger
		},
		postPermalink() {
			const shortcode = this.commentOnPostTrigger?.config?.selectedPostShortcodes?.[0]
			if (!shortcode) return
			return 'https://instagram.com/p/' + shortcode + '/'
		},
	},
}
</script>
