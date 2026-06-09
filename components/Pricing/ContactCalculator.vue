<template>
	<div class="max-w-4xl mx-auto p-6">
		<div class="flex items-baseline justify-center gap-2 mb-4">
			<span class="text-sm text-muted">{{ $t('components.pricing.contactCalculator.prefix') }}</span>
			<input
				v-model="displayValue"
				type="text"
				class="bg-transparent border-0 border-b border-base-300 focus:border-primary focus:rounded focus:outline-none w-32 text-2xl font-bold text-center px-1 py-1"
				@input="handleInputChange"
				@focus="handleFocus"
				@blur="handleBlur"
			/>
			<span class="text-sm text-muted">{{ $t('components.pricing.contactCalculator.suffix') }}</span>
		</div>

		<!-- Slider -->
		<div class="relative">
			<input
				v-model.number="sliderValue"
				type="range"
				min="0"
				max="100"
				step="1"
				class="range range-primary w-full"
				@input="updateContactFromSlider"
			/>
			<div class="relative text-xs text-base-content/50 mt-2 h-4">
				<span
					v-for="(labelObj, index) in sliderLabels"
					:key="index"
					class="absolute transform -translate-x-1/2"
					:style="{ left: getLabelPosition(labelObj.value) + '%' }"
				>
					<span class="sm:hidden">{{ labelObj.shortLabel }}</span>
					<span class="hidden sm:inline">{{ labelObj.label }}</span>
				</span>
			</div>
		</div>
	</div>
</template>

<script>
const defaultMinLimit = 50
const defaultMaxLimit = 1000000
export default {
	props: {
		subscriptionPlanGroups: {
			type: Array,
		},
		initialContactCount: {
			type: Number,
		},
	},
	emits: ['update:contactCount', 'update:selectedPlan'],
	data() {
		return {
			contactCount: this.initialContactCount,
			sliderValue: 25,
			displayValue: '',
			isInputFocused: false,
		}
	},
	mounted() {
		// Başlangıç contact değerine göre slider'ı ayarla
		this.updateSliderFromInput()
		this.updateDisplayValue()
	},
	watch: {
		initialContactCount(newVal) {
			this.contactCount = newVal
			this.updateSliderFromInput()
		},
		contactCount(newVal) {
			this.updateDisplayValue()
		},
	},
	computed: {
		sliderLabels() {
			if (!this.subscriptionPlanGroups || this.subscriptionPlanGroups.length === 0) {
				return []
			}

			// subscriptionPlans'dan activeContactLimit değerlerini al ve sırala
			const limits = this.subscriptionPlanGroups.map((planGroup) => planGroup.activeContactLimit).sort((a, b) => a - b)

			if (limits.length === 0) {
				return []
			}

			const locale = this.$i18n?.locale || 'en'

			// Backend'den gelen gerçek limit değerlerini kullan
			return limits.map((limit) => ({
				value: limit,
				label: limit.toLocaleString(locale),
				shortLabel: this.formatNumber(limit, locale),
			}))
		},
		selectedPlanForCurrentContact() {
			if (!this.subscriptionPlanGroups || this.subscriptionPlanGroups.length === 0) {
				return null
			}

			// Contact sayısına göre uygun planı bul
			const sortedPlans = [...this.subscriptionPlanGroups].sort((a, b) => {
				return a.activeContactLimit - b.activeContactLimit
			})

			for (let planGroup of sortedPlans) {
				if (this.contactCount <= planGroup.activeContactLimit) {
					return planGroup.groupKey
				}
			}

			// En yüksek plandan da fazlaysa, en yüksek planı döndür
			const highestPlan = sortedPlans[sortedPlans.length - 1]
			return highestPlan ? highestPlan.groupKey : null
		},
	},
	methods: {
		updateContactFromSlider() {
			if (!this.subscriptionPlanGroups || this.subscriptionPlanGroups.length === 0) {
				return
			}

			// subscriptionPlans'dan activeContactLimit değerlerini al ve sırala
			const limits = this.subscriptionPlanGroups.map((planGroup) => planGroup.activeContactLimit).sort((a, b) => a - b)

			if (limits.length === 0) return

			const minLimit = Math.min(defaultMinLimit, limits[0])
			const maxLimit = Math.max(defaultMaxLimit, limits[limits.length - 1])

			// Slider değerini contact sayısına çevir (logaritmik ölçek)
			const sliderPercent = this.sliderValue / 100

			// Logaritmik dağılım için
			const logMin = Math.log(minLimit)
			const logMax = Math.log(maxLimit)
			const logValue = logMin + sliderPercent * (logMax - logMin)

			this.contactCount = Math.round(Math.exp(logValue))

			// Parent component'e değişiklikleri bildir
			this.emitUpdates()
		},
		updateSliderFromInput() {
			if (!this.subscriptionPlanGroups || this.subscriptionPlanGroups.length === 0) {
				return
			}

			const limits = this.subscriptionPlanGroups.map((planGroup) => planGroup.activeContactLimit).sort((a, b) => a - b)

			if (limits.length === 0) return

			const minLimit = Math.min(defaultMinLimit, limits[0])
			const maxLimit = Math.max(defaultMaxLimit, limits[limits.length - 1])

			// Contact sayısını slider değerine çevir (logaritmik ölçek)
			const clampedValue = Math.max(minLimit, Math.min(maxLimit, this.contactCount))

			const logMin = Math.log(minLimit)
			const logMax = Math.log(maxLimit)
			const logValue = Math.log(clampedValue)

			this.sliderValue = ((logValue - logMin) / (logMax - logMin)) * 100

			// Parent component'e değişiklikleri bildir
			this.emitUpdates()
		},
		formatNumber(num, locale = 'en') {
			const thousandsSuffix = locale === 'tr' ? 'B' : 'K'
			if (num >= 1000000) {
				return Math.round(num / 1000000) + 'M'
			} else if (num >= 1000) {
				return Math.round(num / 1000) + thousandsSuffix
			}
			return num.toString()
		},
		emitUpdates() {
			// Contact sayısını parent'a bildir
			this.$emit('update:contactCount', this.contactCount)

			// Seçilen planı parent'a bildir
			const selectedPlan = this.selectedPlanForCurrentContact
			if (selectedPlan) {
				this.$emit('update:selectedPlan', selectedPlan)
			}
		},
		updateDisplayValue() {
			// Focus durumunda formatlanmış değer gösterme
			if (this.isInputFocused) {
				this.displayValue = this.contactCount.toString()
			} else {
				// $formatNumber varsa onu kullan, yoksa kendi formatter'ı kullan
				if (this.$formatNumber) {
					this.displayValue = this.$formatNumber(this.contactCount, this.$i18n?.locale || 'en')
				} else {
					this.displayValue = this.formatNumber(this.contactCount)
				}
			}
		},
		handleInputChange(event) {
			// Sadece sayıları al, virgül ve nokta karakterlerini temizle
			const rawValue = event.target.value.replace(/[^\d]/g, '')
			const numValue = parseInt(rawValue) || 0

			// Limitleri kontrol et
			if (numValue >= 1 && numValue <= defaultMaxLimit) {
				this.contactCount = numValue
				this.updateSliderFromInput()
			}
		},
		handleFocus() {
			this.isInputFocused = true
			this.displayValue = this.contactCount.toString()
		},
		handleBlur() {
			this.isInputFocused = false
			this.updateDisplayValue()
		},
		getLabelPosition(contactValue) {
			if (!this.subscriptionPlanGroups || this.subscriptionPlanGroups.length === 0) {
				// Fallback için basit hesaplama
				const minLimit = defaultMinLimit
				const maxLimit = defaultMaxLimit
				const logMin = Math.log(minLimit)
				const logMax = Math.log(maxLimit)
				const logValue = Math.log(contactValue)
				return ((logValue - logMin) / (logMax - logMin)) * 100
			}

			// subscriptionPlans'dan min/max değerleri al
			const limits = this.subscriptionPlanGroups.map((planGroup) => planGroup.activeContactLimit).sort((a, b) => a - b)
			const minLimit = Math.min(defaultMinLimit, limits[0])
			const maxLimit = Math.max(defaultMaxLimit, limits[limits.length - 1])

			// Logaritmik ölçekte pozisyon hesapla (slider'ın mantığıyla aynı)
			const clampedValue = Math.max(minLimit, Math.min(maxLimit, contactValue))
			const logMin = Math.log(minLimit)
			const logMax = Math.log(maxLimit)
			const logValue = Math.log(clampedValue)

			return ((logValue - logMin) / (logMax - logMin)) * 100
		},
	},
}
</script>
