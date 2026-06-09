<template>
	<textarea
		ref="textarea"
		@keydown.enter="handleEnter"
		v-model="input"
		class="resize-none"
		@input="onInput"
		v-bind="$attrs"
	/>
	<!--		class="resize-none"-->
</template>
<script>
export default {
	inheritAttrs: true,
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		maxHeight: {
			type: Number,
			default: 500,
		},
	},
	data() {
		const { largerThan } = useWindowSize()
		return {
			largerThan,
			input: this.modelValue,
		}
	},
	watch: {
		input(value) {
			this.$emit('update:modelValue', value)
		},
		modelValue(newValue) {
			// Prop değiştiğinde input değerini güncelle
			if (this.input !== newValue) {
				this.input = newValue
			}
		},
	},
	mounted() {
		// Textarea'nın otomatik boyutlandırılması
		// this.adjustHeight()
		this.$nextTick(this.adjustHeight)
	},
	methods: {
		handleEnter(e) {
			if (!this.largerThan.sm) {
				e.stopPropagation()
			}
		},
		adjustHeight() {
			const textarea = this.$refs.textarea
			if (!textarea) return

			// Minimuma sıfırla ve içeriğe göre yeniden boyutlandır
			textarea.style.height = 'auto'
			const borderHeight = textarea.offsetHeight - textarea.clientHeight
			textarea.style.height = textarea.scrollHeight + borderHeight + 'px'

			if (textarea.scrollHeight > this.maxHeight) {
				textarea.style.height = this.maxHeight + 'px'
			}
		},

		onInput(e) {
			this.$nextTick(this.adjustHeight)
		},
		resize() {
			this.$nextTick(this.adjustHeight)
		},
    focus(){
      this.$refs.textarea.focus()
    },
    blur(){
      this.$refs.textarea.blur()
    }
	},
}
</script>
<style scoped>
.resize-none {
	resize: none;
	/* overflow-y: hidden */ /* Kaydırma çubuğunu gizle */
	/* min-height: 2.5rem; /* Minimum yükseklik */
}
</style>
