<template>
	<div>
		<!-- Tags Display -->
		<div v-if="modelValue.length > 0 && showTags" class="flex flex-wrap gap-2">
			<div
				v-for="(tag, index) in modelValue"
				:key="`tag-${index}`"
				class="badge badge-sm gap-2 cursor-pointer"
				:class="badgeClass"
				@click="removeTag(index)"
			>
				{{ tag }}
				<i class="fa fa-times-circle text-xs"></i>
			</div>
		</div>

		<!-- Input -->
		<div class="flex items-center gap-2 mt-2">
			<input
				ref="tagInput"
				v-model="currentTag"
				type="text"
				:placeholder="placeholder"
				class="input input-sm flex-1"
				@keydown.enter.prevent="addTag"
				@input="handleInput"
				@blur="addTag"
			/>
			<button @click="addTag" :disabled="!currentTag.trim()" class="btn btn-sm btn-soft" :class="addButtonClass">
				<i class="fa fa-plus mr-1"></i>
				{{ addButtonText }}
			</button>
		</div>
	</div>
</template>

<script>
import { optionTypes } from '~/models/Flow/utils/utils.js'

export default {
	props: {
		modelValue: {
			type: Array,
			default: () => [],
		},
		showTags: {
			type: Boolean,
			default: true,
		},
		label: {
			type: String,
			default: '',
		},
		placeholder: {
			type: String,
		},
		iconClass: {
			type: String,
			default: '',
		},
		addButtonText: {
			type: String,
		},
		addButtonClass: {
			type: String,
			default: '',
		},
		badgeClass: {
			type: String,
			default: 'bg-base-content/10',
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			currentTag: '',
		}
	},
	methods: {
		handleInput(event) {
			const value = event.target.value
			if (value.includes(',')) {
				// Virgül varsa, virgülden önceki kısmı tag olarak ekle
				const tagText = value.replace(',', '').trim()
				if (tagText) {
					this.currentTag = tagText
					this.addTag()
				} else {
					this.currentTag = ''
				}
			}
		},
		addTag() {
			const tag = this.currentTag.trim()
			if (tag && !this.modelValue.includes(tag)) {
				const newTags = [...this.modelValue, tag]
				this.$emit('update:modelValue', newTags)
				this.currentTag = ''
				this.$nextTick(() => {
					this.$refs.tagInput.focus()
				})
			}
		},
		removeTag(index) {
			const newTags = [...this.modelValue]
			newTags.splice(index, 1)
			this.$emit('update:modelValue', newTags)
		},
	},
}
</script>
