<template>
	<ClientOnly>
		<VDropdown
			v-if="renderVDropdown"
			v-bind="$attrs"
			ref="dropdown"
			class="z-1"
			:autoHide="handleAutoHide"
			@show="$emit('show')"
			@hide="$emit('hide')"
			@applyHide="$emit('hidden')"
			@applyShow="$emit('shown')"
		>
			<slot />

			<template #fallback>
				<!-- this will be rendered on server side -->
				<slot />

				<div class="invisible absolute">
					<slot name="popper" :shown="false" :show="() => {}" :hide="() => {}" />
				</div>
			</template>

			<template #popper="{ shown, show, hide }">
				<slot name="popper" :shown="shown" :show="show" :hide="hide" />
			</template>
		</VDropdown>
		<div class="hidden">
			<VDropdown ref="dismissDropdown" />
		</div>
	</ClientOnly>
</template>

<script>
import { Dropdown as VDropdown } from 'floating-vue'

export default {
	components: {
		VDropdown,
	},
	inheritAttrs: false,
	data() {
		return {
			renderVDropdown: true,
		}
	},
	emits: ['show', 'hide', 'shown', 'hidden'],
	methods: {
		handleAutoHide(event) {
			if (this.$attrs.autoHide === false) return false
			if (event.target?.closest('[data-prevent-dropdown-close]') || event.target?.closest('.prevent-dropdown-close')) {
				return false
			}
			return true
		},
		show() {
			this.$refs.dropdown?.show()
		},
		hide() {
			this.$refs.dismissDropdown?.show()
			setTimeout(() => {
				this.renderVDropdown = false
				this.$nextTick(() => {
					this.renderVDropdown = true
				})
			}, 0)
		},
	},
}
</script>
