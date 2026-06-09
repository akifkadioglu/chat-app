<template>
	<FlowSetup
		:second-trailing-style="trailingStyle"
		second-trailing-width-classes="max-w-4/5 md:max-w-150 lg:min-w-80 border-r border-subtle"
		second-trailing-show-size="md"
		:disableSelectAllAccount="true"
		:disableAccountChange="true"
		mainContentClasses="flex-1 h-full"
		:adminPreview="adminPreview"
	>
		<Diagram @focusedNode="showSettings = true" />
		<div
			class="absolute top-1/2 right-0 -translate-y-1/2 z-10 md:flex hidden h-full cursor-ew-resize items-center justify-center bg-muted"
			:class="{
				'cursor-pointer w-5': !showSettings,
				'w-1.5': showSettings,
			}"
			@mousedown="startResize"
			@dblclick="handleDoubleClick"
		>
			<i :class="showSettings ? 'fa fa-grip-lines-vertical' : 'fa fa-chevron-left'" class="text-xs text-muted" />
		</div>
		<template #secondTrailingContent v-if="showSettings">
			<NodeSettings />
		</template>
	</FlowSetup>
</template>

<script>
import Flow from '~/components/Flow/Flow.vue'
import NodeSettings from '~/components/Flow/NodeSettings.vue'
import FlowSetup from '~/components/Flow/FlowSetup.vue'
import Diagram from '~/components/Flow/Diagram/Diagram.vue'

export default {
	components: {
		Diagram,
		NodeSettings,
		Flow,
		FlowSetup,
	},
	props: {
		adminPreview: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		const { size, largerThan } = useWindowSize()
		return {
			size,
			largerThan,
			showSettings: true,
			isLarge: false,
			panelWidth: 368,
			isResizing: false,
			hasDragged: false,
		}
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	mounted() {
		this.$emitter.on('trailingDrawerClosed', () => {
			this.showSettings = false
		})
		this.$emitter.on('trailingDrawerOpened', () => {
			this.showSettings = true
		})

		if (this.isMobile) {
			this.showSettings = true
		}
	},
	watch: {
		'flowStore.focusedNodeUuid'() {
			this.showSettings = true
		},
		isMobile(newVal) {
			if (newVal) {
				this.showSettings = true
			}
		},
	},
	computed: {
		trailingStyle() {
			if (!this.showSettings) return { minWidth: '288px', width: '80%' }
			return { width: `${this.panelWidth}px`, transition: this.isResizing ? 'none' : 'width 0.2s ease' }
		},
		isMobile() {
			return !this.largerThan.md
		},
	},
	methods: {
		togglePanel() {
			this.showSettings = !this.showSettings
			if (this.showSettings) {
				this.$nextTick(() => {
					this.$emitter.emit('openTrailingDrawer')
				})
				return
			}
			this.isLarge = false
		},
		startResize(e) {
			this.isResizing = true
			this.hasDragged = false
			document.addEventListener('mousemove', this.onResize)
			document.addEventListener('mouseup', this.stopResize)
			e.preventDefault()
		},
		onResize(e) {
			if (!this.isResizing) return
			this.hasDragged = true
			const newWidth = window.innerWidth - e.clientX - 25
			if (newWidth < 150) {
				this.showSettings = false
				this.stopResize()
				return
			}
			this.panelWidth = Math.max(280, Math.min(newWidth, 600))
		},
		stopResize() {
			this.isResizing = false
			if (!this.hasDragged && !this.showSettings) {
				this.togglePanel()
			}
			document.removeEventListener('mousemove', this.onResize)
			document.removeEventListener('mouseup', this.stopResize)
		},
		handleDoubleClick() {
			if (this.showSettings) {
				this.showSettings = false
			}
		},
	},
}
</script>
