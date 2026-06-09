<template>
	<div class="flex flex-col gap-3">
		<!-- Rule Card -->
		<div class="flex items-start gap-2">
			<div class="flex flex-col items-baseline gap-2 w-full">
				<!-- Operator Selector -->
				<div class="w-full">
					<div class="flex w-full gap-1">
						<CustomDropdown class="w-full flex-1" ref="operatorDropdown" placement="bottom-start">
							<button class="btn btn-outline border-muted btn-sm justify-between truncate w-full">
								<span class="text-nowrap truncate">
									<span v-if="options.operator">
										{{ $t(`components.flow.node.conditions.comparison.operators.${options.operator}`) }}
									</span>
									<span v-else class="text-base-content/50">
										{{ $t('components.flow.node.triggers.partials.scoreFilterBuilder.selectOperator') }}
									</span>
								</span>
								<i class="fa fa-chevron-down text-xs"></i>
							</button>
							<template #popper>
								<ul class="menu bg-base-100 rounded-box shadow-lg min-w-48 p-2">
									<li v-for="operator in availableOperators" :key="operator">
										<button
											@click="selectOperator(operator)"
											class="btn btn-ghost w-full justify-start"
											:class="{ active: options.operator === operator }"
										>
											{{ $t(`components.flow.node.conditions.comparison.operators.${operator}`) }}
										</button>
									</li>
								</ul>
							</template>
						</CustomDropdown>
					</div>
					<!-- Description -->
					<p class="mt-2 text-xs text-muted">
						<i class="fa fa-info-circle text-info" />
						{{ $t('components.flow.node.triggers.partials.scoreFilterBuilder.description') }}
					</p>
				</div>

				<!-- Score Value Input -->
				<div v-if="options.operator" class="flex-1 w-full">
					<div class="flex items-center gap-2">
						<input
							v-model.number="options.value"
							type="range"
							min="-100"
							max="100"
							class="range range-xs range-primary flex-1"
						/>
						<div class="flex items-center gap-1">
<!--							<input-->
<!--								v-model.number="options.value"-->
<!--								type="number"-->
<!--								ref="valueInput"-->
<!--								min="-100"-->
<!--								max="100"-->
<!--								@focus="$refs.valueInput.select()"-->
<!--								class="input input-ghost min-w-0 w-min !overflow-visible [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-0"-->
<!--							/>-->
													<div
														ref="valueInput"
														contenteditable="true"
														inputmode="numeric"
														class="min-w-8 text-end outline-none"
														@input="onValueInput"
														@blur="onValueBlur"
														@focus="onValueFocus"
														@keydown="onValueKeydown"
														@paste="onValuePaste"
													>{{ options.value }}</div>
							<span class="text-sm font-medium">%</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { comparisonOperators } from '~/models/Flow/utils/utils'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
	},
	props: {
		options: {
			type: Object,
			required: true,
		},
	},
	computed: {
		availableOperators() {
			return comparisonOperators.score || []
		},
	},
	methods: {
		selectOperator(operator) {
			this.options.operator = operator
			if (this.options.value === undefined || this.options.value === null) {
				this.options.value = 0
			}
			this.$refs.operatorDropdown.hide()
		},
		onValueInput(e) {
			const text = e.target.innerText.replace(/[^0-9-]/g, '')
			let value = parseInt(text, 10)
			if (!isNaN(value)) {
				value = Math.max(-100, Math.min(100, value))
				this.options.value = value
			}
		},
		onValueBlur(e) {
			e.target.innerText = this.options.value
		},
		onValueFocus(e) {
			const range = document.createRange()
			range.selectNodeContents(e.target)
			const selection = window.getSelection()
			selection.removeAllRanges()
			selection.addRange(range)
		},
		onValueKeydown(e) {
			// İzin verilen tuşlar: 0-9, -, Backspace, Delete, Arrow keys, Tab, Enter
			const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']

			if (e.key === 'Enter') {
				e.preventDefault()
				this.$refs.valueInput.blur()
				return
			}

			if (allowedKeys.includes(e.key)) return

			// Ctrl/Cmd kombinasyonları (copy, paste, select all)
			if (e.ctrlKey || e.metaKey) return

			// Sadece rakamlar ve eksi işareti
			if (!/^[0-9-]$/.test(e.key)) {
				e.preventDefault()
				return
			}

			// Eksi işareti sadece başta olabilir
			if (e.key === '-') {
				const text = e.target.innerText
				const selection = window.getSelection()
				if (selection.anchorOffset !== 0 || text.includes('-')) {
					e.preventDefault()
				}
			}
		},
		onValuePaste(e) {
			e.preventDefault()
			const text = (e.clipboardData || window.clipboardData).getData('text')
			const cleanedText = text.replace(/[^0-9-]/g, '')
			document.execCommand('insertText', false, cleanedText)
		},
	},
}
</script>

<style scoped></style>
