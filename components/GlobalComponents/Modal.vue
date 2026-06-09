<template>
	<dialog ref="modal" class="modal cursor-default" @keydown.esc="handleEscKey">
		<div ref="modalBox" class="modal-box relative" :class="[{ 'scale-pulse': isPulsing }, size]">
			<!-- Sade X butonu -->
			<button
				v-if="showXButton && closeable"
				@click="hideModal"
				class="absolute top-4 right-4 size-10 flex items-center justify-center text-muted z-10 btn-transition"
				aria-label="Close"
			>
				<svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<div class="pb-5" :class="bodyClass">
				<slot :isOpen="isOpen" />
			</div>
			<div
				v-if="showCloseButton"
				class="modal-action border-t border-muted mt-0 pt-6 flex items-center justify-between gap-3"
			>
				<div class="flex-1 min-w-0">
					<slot name="footerLeft" />
				</div>
				<div class="flex items-center gap-2">
					<form method="dialog">
						<button class="btn btn-secondary btn-soft b">
							{{ $t('components.globalComponents.auth.authModal.closeButton') }}
						</button>
					</form>
					<slot name="buttonNearClose" />
				</div>
			</div>
		</div>
		<form :method="closeable ? 'dialog' : null" class="modal-backdrop" @click="handleBackdropClick">
			<button v-if="closeable">close</button>
		</form>
	</dialog>
</template>
<script>
export default {
	props: {
		showCloseButton: {
			type: Boolean,
			default: true,
		},
		showXButton: {
			type: Boolean,
			default: true,
		},
		closeable: {
			type: Boolean,
			default: true,
		},
		size: {
			type: String,
		},
		bodyClass: {
			type: String,
		},
	},
	data() {
		return {
			isPulsing: false,
			isOpen: false,
		}
	},
	emits: ['open', 'opened', 'close', 'closed'],
	mounted() {
		const dialog = this.$refs.modal
		const modalBox = dialog?.$refs?.modalBox

		// Existing close works; keep emitting immediately (or you can also wait for transition if needed)
		dialog?.addEventListener('close', () => {
			setTimeout(() => {
				this.$emit('closed')
			}, 300) // Slight delay to allow dialog to close visually
			this.$emit('close')
		})

		// Observe the "open" attribute because <dialog> does not fire an "open" event
		const observer = new MutationObserver(() => {
			if (dialog?.open) {
				this.$emit('open')
				// When it becomes open, wait for the modal-box transition to finish
				if (modalBox) {
					const onEnd = (e) => {
						if (e.target !== modalBox) return
						modalBox.removeEventListener('transitionend', onEnd)
						this.$emit('opened')
					}
					// Listen once for the end of the opening transition
					modalBox.addEventListener('transitionend', onEnd, { once: true })

					// Fallback: if there is no transition, emit on next frame
					requestAnimationFrame(() => {
						const cs = getComputedStyle(modalBox)
						const dur = (parseFloat(cs.transitionDuration) || 0) + (parseFloat(cs.transitionDelay) || 0)
						if (dur === 0) {
							this.$emit('opened')
						}
					})
				} else {
					this.$emit('opened')
				}
			}
		})

		if (dialog) {
			observer.observe(dialog, { attributes: true, attributeFilter: ['open'] })
		}
		// store for cleanup
		this._modalObserver = observer
	},

	beforeUnmount() {
		if (this._modalObserver) {
			this._modalObserver.disconnect()
			this._modalObserver = null
		}
	},
	methods: {
		showModal() {
			this.$refs.modal?.show()
			this.isOpen = true
		},
		hideModal() {
			this.$refs.modal?.close()
			this.isOpen = false
		},
		handleEscKey(event) {
			if (!this.closeable) {
				event.preventDefault()
				event.stopPropagation()
				this.triggerPulse()
			}
		},
		handleBackdropClick(event) {
			if (!this.closeable) {
				event.preventDefault()
				event.stopPropagation()
				this.triggerPulse()
			}
		},
		triggerPulse() {
			this.isPulsing = true
			setTimeout(() => {
				this.isPulsing = false
			}, 600)
		},
	},
}
</script>

<style scoped>
@keyframes scalePulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
	100% {
		transform: scale(1);
	}
}

.scale-pulse {
	animation: scalePulse 0.6s ease-in-out;
}
</style>
