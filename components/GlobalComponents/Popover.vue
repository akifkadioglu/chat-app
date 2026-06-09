<template>
	<div class="relative">
		<div @click="togglePopover" ref="triggerElement">
			<slot name="trigger" :isOpen="showPopover" />
		</div>

		<Teleport to="body">
			<div
				v-if="showPopover"
				class="fixed bg-base-100 rounded-box shadow-lg border border-base-300 z-99"
				:class="[width, padding]"
				:style="popoverStyle"
				@click.stop
			>
				<slot name="content" :close="closePopover" />
			</div>
		</Teleport>
	</div>
</template>

<script>
export default {
	name: 'Popover',
	props: {
		width: {
			type: String,
			default: 'w-80',
		},
		padding: {
			type: String,
			default: 'p-4',
		},
		alignment: {
			type: String,
			default: 'right',
			validator: (value) => ['left', 'right', 'center'].includes(value),
		},
		offset: {
			type: Number,
			default: 8,
		},
		margin: {
			type: Number,
			default: 8,
		},
	},
	data() {
		const { size } = useWindowSize()
		return {
			size,
			showPopover: false,
			popoverStyle: {},
		}
	},
	beforeUnmount() {
		this.cleanup()
	},
	watch: {
		'size.width'() {
			if (this.showPopover) this.calculatePosition()
		},
		'size.height'() {
			if (this.showPopover) this.calculatePosition()
		},
	},

	methods: {
		togglePopover() {
			this.showPopover ? this.closePopover() : this.openPopover()
		},
		openPopover() {
			this.showPopover = true
			this.$nextTick(() => {
				this.calculatePosition()
				this.addListeners()
			})
			this.$emit('open')
		},
		closePopover() {
			this.showPopover = false
			this.cleanup()
			this.$emit('close')
		},
		addListeners() {
			document.addEventListener('click', this.handleClickOutside)
			// window.addEventListener('resize', this.calculatePosition)
			window.addEventListener('scroll', this.calculatePosition, true)
		},
		cleanup() {
			document.removeEventListener('click', this.handleClickOutside)
			// window.removeEventListener('resize', this.calculatePosition)
			window.removeEventListener('scroll', this.calculatePosition, true)
		},
		calculatePosition() {
			if (!this.$refs.triggerElement) return

			const rect = this.$refs.triggerElement.getBoundingClientRect()
			consoleLog('Trigger rect:', rect)
			const popoverWidth = this.getWidth()
			const popoverHeight = 180

			let left = this.getLeftPosition(rect, popoverWidth)
			let top = rect.bottom + this.offset

			const innerWidth = this.size.width
			const innerHeight = this.size.height

			if (left < this.margin) {
				left = this.margin
			} else if (left + popoverWidth > innerWidth - this.margin) {
				left = innerWidth - popoverWidth - this.margin
			}

			if (top + popoverHeight > innerHeight - this.margin) {
				top = rect.top - popoverHeight - this.offset
				if (top < this.margin) top = this.margin
			}

			this.popoverStyle = { left: `${left}px`, top: `${top}px` }
		},
		getLeftPosition(rect, popoverWidth) {
			switch (this.alignment) {
				case 'left':
					return rect.left
				case 'center':
					return rect.left + rect.width / 2 - popoverWidth / 2
				case 'right':
				default:
					return rect.right - popoverWidth
			}
		},
		getWidth() {
			const widths = { 'w-48': 192, 'w-56': 224, 'w-64': 256, 'w-72': 288, 'w-80': 320, 'w-96': 384 }
			return widths[this.width] || 320
		},
		handleClickOutside(event) {
			if (!this.$refs.triggerElement?.contains(event.target)) {
				this.closePopover()
			}
		},
	},
}
</script>
