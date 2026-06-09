<template>
	<div class="relative">
		<!-- Input -->
		<input
			:value="modelValue"
			@input="onInput($event)"
			@focus="showDropdown = true"
			@blur="hideDropdown"
			class="input input-sm input-bordered w-48"
			:placeholder="placeholder || $t('components.globalComponents.searchBox.placeholder')"
		/>

		<!-- Dropdown -->
		<div
			v-if="showDropdown"
			class="absolute top-full left-0 right-0 bg-base-100 border border-base-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
		>
			<!-- Eğer sonuç varsa -->
			<template v-if="results.length">
				<div
					v-for="element in results"
					:key="element[idKey]"
					@mousedown.prevent="selectItem(element)"
					class="px-3 py-2 hover:bg-base-200 cursor-pointer text-sm"
				>
					<slot name="option" :element="element">
						{{ element[labelKey] }}
					</slot>
				</div>
			</template>

			<!-- Sonuç yoksa -->
			<template v-else>
				<div class="px-3 py-2 text-gray-400 text-sm">
					<slot name="noResults">{{ $t('components.globalComponents.searchBox.noResults') }}</slot>
				</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'SearchBox',
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		placeholder: {
			type: String,
			default: '',
		},
		idKey: {
			type: String,
			required: true,
		},
		labelKey: {
			type: String,
			required: true,
		},
		list: {
			type: Array as () => Record<string, any>[],
			default: () => [],
		},
		debounce: {
			type: Number,
			default: 200,
		},
	},
	emits: ['update:modelValue', 'select'],
	data() {
		return {
			showDropdown: false,
			results: [] as Record<string, any>[],
			debounceTimer: null as ReturnType<typeof setTimeout> | null,
		}
	},
	methods: {
		onInput(e: Event) {
			const value = (e.target as HTMLInputElement).value
			this.$emit('update:modelValue', value)

			if (this.debounceTimer) clearTimeout(this.debounceTimer)
			this.debounceTimer = setTimeout(() => {
				this.filterList(value)
			}, this.debounce)
		},
		hideDropdown() {
			setTimeout(() => (this.showDropdown = false), 150)
		},
		filterList(query: string) {
			if (!query.trim()) {
				this.results = []
				return
			}
			const lower = query.toLowerCase()
			this.results = this.list
				.filter(
					(item) =>
						String(item[this.labelKey]).toLowerCase().includes(lower) ||
						String(item[this.idKey]).toLowerCase().includes(lower),
				)
				.slice(0, 10)
		},
		selectItem(item: Record<string, any>) {
			this.$emit('select', item)
			this.$emit('update:modelValue', item[this.labelKey])
			this.showDropdown = false
		},
	},
})
</script>
