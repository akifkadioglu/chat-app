<template>
	<div v-bind="$attrs" :style="{ 'anchor-name': anchorName }">
		<div @click="toggle">
			<slot />
		</div>
		<div
			ref="popoverRef"
			popover="auto"
			:style="{ 'position-anchor': anchorName }"
			:class="['m-0 p-0 bg-transparent border-0 overflow-visible', positionAreaClass]"
			@toggle="onToggle"
		>
			<slot name="popper" :shown="isOpen" :show="show" :hide="hide" />
		</div>
	</div>
</template>

<script>
export default {
	inheritAttrs: false,
	emits: ['show', 'hide', 'shown', 'hidden'],
	props: {
		placement: {
			type: String,
			default: 'bottom-start',
		},
	},
	setup() {
		return { dropdownId: useId() }
	},
	data() {
		return {
			isOpen: false,
		}
	},
	computed: {
		anchorName() {
			return `--dd-${this.dropdownId}`
		},
		positionAreaClass() {
			const map = {
				bottom: '[position-area:bottom]',
				'bottom-start': '[position-area:bottom_span-right]',
				'bottom-end': '[position-area:bottom_span-left]',
				top: '[position-area:top]',
				'top-start': '[position-area:top_span-right]',
				'top-end': '[position-area:top_span-left]',
			}
			return map[this.placement] || '[position-area:bottom_span-right]'
		},
	},
	methods: {
		toggle() {
			if (!this.$refs.popoverRef?.togglePopover) return
			this.$refs.popoverRef.togglePopover()
		},
		show() {
			if (!this.$refs.popoverRef?.showPopover) return
			this.$refs.popoverRef.showPopover()
		},
		hide() {
			if (!this.$refs.popoverRef?.hidePopover) return
			this.$refs.popoverRef.hidePopover()
		},
		onToggle(event) {
			const opening = event.newState === 'open'
			this.isOpen = opening
			if (opening) {
				this.$emit('show')
				this.$nextTick(() => this.$emit('shown'))
			} else {
				this.$emit('hide')
				this.$nextTick(() => this.$emit('hidden'))
			}
		},
	},
}
</script>
