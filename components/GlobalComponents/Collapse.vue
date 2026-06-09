<template>
	<div class="overflow-hidden">
		<div
			:class="{
				collapse: collapsible,
				'collapse-open': isOpen,
				'collapse-close': !isOpen,
				'collapse-arrow': showArrow,
				'reverse-arrow': reverseArrow,
			}"
		>
			<input
				v-if="collapsible"
				ref="collapseInput"
				type="checkbox"
				class="collapse-toggle cursor-pointer"
				v-model="isOpen"
				@change="handleToggle"
			/>
			<div
				class="collapse-title cursor-pointer"
				@click="toggle"
				:class="[titleClass, { 'pointer-events-none': !collapsible }]"
			>
				<slot name="title" :isOpen="isOpen">
					<span>{{ title }}</span>
				</slot>
			</div>
			<div :class="[contentClass, { 'collapse-content': collapsible }]">
				<slot :isOpen="isOpen">
					<!--					<p>Collapse content goes here</p>-->
				</slot>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Collapse',
	props: {
		open: {
			type: Boolean,
			default: false,
		},
		showArrow: {
			type: Boolean,
			default: false,
		},
		reverseArrow: {
			type: Boolean,
			default: false,
		},
		titleClass: {
			type: String,
			default: '',
		},
		contentClass: {
			type: String,
			default: '',
		},
		title: {
			type: String,
		},
		collapsible: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			isOpen: this.open,
		}
	},
	emits: ['beforeOpen', 'open', 'opened', 'beforeClose', 'close', 'closed'],
	watch: {
		open(newVal) {
			if (newVal !== this.isOpen) {
				this.isOpen = newVal
			}
		},
	},
	methods: {
		showCollapse() {
			if (!this.isOpen) {
				this.$emit('beforeOpen')
				this.isOpen = true
			}
		},
		hideCollapse() {
			if (this.isOpen) {
				this.$emit('beforeClose')
				this.isOpen = false
			}
		},
		toggle() {
			if (this.isOpen) {
				this.hideCollapse()
			} else {
				this.showCollapse()
			}
		},
		handleToggle() {
			// Bu method checkbox değiştiğinde çalışır
			if (this.isOpen) {
				this.$emit('beforeOpen')
				this.$emit('open')
				// Açılma animasyonu bitince opened event'ini fırlat
				this.$nextTick(() => {
					setTimeout(() => {
						this.$emit('opened')
					}, 300) // DaisyUI collapse animasyon süresi
				})
			} else {
				this.$emit('beforeClose')
				this.$emit('close')
				// Kapanma animasyonu bitince closed event'ini fırlat
				this.$nextTick(() => {
					setTimeout(() => {
						this.$emit('closed')
					}, 300) // DaisyUI collapse animasyon süresi
				})
			}
		},
	},
}
</script>

<style scoped>
.collapse-open {
	overflow: unset !important;
}

.collapse-open:has(.dropdown:focus-within),
.collapse-open:has(.dropdown.dropdown-open),
.collapse-open:has(.dropdown > .btn[aria-expanded='true']),
.collapse-open:has(.dropdown > button[aria-expanded='true']),
.collapse-open:has(.dropdown > a[aria-expanded='true']),
.collapse-open:has(.dropdown .dropdown-content:focus-within),
.collapse-open:has(.dropdown:hover),
.collapse-open:has(.dropdown > .btn:focus),
.collapse-open:has(.dropdown > button:focus),
.collapse-open:has(.dropdown > a:focus) {
	position: relative;
	z-index: 99;
}

/* Reverse arrow rotation - sadece reverseArrow prop'u true ise */
.reverse-arrow.collapse-arrow .collapse-title::after {
	transform: rotate(225deg);
}

.reverse-arrow.collapse-open.collapse-arrow .collapse-title::after {
	transform: rotate(45deg);
}
</style>
