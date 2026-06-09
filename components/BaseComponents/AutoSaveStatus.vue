<template>
	<div class="z-1 text-base-content/60 text-sm bg-base-100/80 p-1 rounded-sm">
		<div v-if="autoSaveStatus === 'saved'" class="flex items-center gap-1">
			<i class="fa fa-check-circle text-success"></i>
			<span class="hidden md:inline">{{ $t('components.baseComponents.autoSaveStatus.allChangesSaved') }}</span>
			<!--			<span>{{ $t('components.baseComponents.autoSaveStatus.lastSavedAt', { time: lastSavedTime }) }}</span>-->
		</div>
		<div v-else-if="autoSaveStatus === 'changed'" class="flex items-center gap-1">
			<i class="fa fa-clock text-warning" />
			<span class="hidden md:inline">{{ $t('components.baseComponents.autoSaveStatus.flowChanged') }}</span>
		</div>
		<div v-else-if="autoSaveStatus === 'saving'" class="flex items-center gap-1">
			<loading-element />
		</div>
		<div v-else-if="autoSaveStatus === 'error'" class="flex items-center gap-1">
			<button @click="performAutoSave" class="btn btn-sm btn-soft">
				<loading-element :is-loading="errorLoading" size="15">
					<i class="fa fa-redo" />
				</loading-element>
			</button>
			<span>
				<span class="hidden md:inline">{{ $t('components.baseComponents.autoSaveStatus.saveFailed') }}</span>
				<i class="fa fa-exclamation-triangle text-error"></i>
			</span>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { useFlowStore } from '~/stores/flow.ts'

export default {
	components: { LoadingElement },
	props: {
		saveFunction: {
			type: Function,
			required: true,
		},
		debounceTime: {
			type: Number,
			default: 2000,
		},
	},
	inject: ['canPublish'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			autoSaveStatus: null, // 'saved', 'changed', 'saving', 'error'
			lastSavedTime: null,
			autoSaveTimeout: null,
			errorLoading: false,
		}
	},
	mounted() {
		// Eğer target zaten kaydedilmişse, saved durumunda başla
		if (this.flowStore?.flow?.id) {
			this.autoSaveStatus = 'saved'
			this.updateLastSavedTime()
		}

		// Status değişikliklerini parent'a bildir
		this.canPublish = this.computedCanPublish

		this.$emitter.on('flowSaved', () => {
			this.autoSaveStatus = 'saved'
			this.updateLastSavedTime()
		})
	},
	beforeUnmount() {
		// AutoSave timeout'unu temizle
		if (this.autoSaveTimeout) {
			clearTimeout(this.autoSaveTimeout)
		}
	},
	watch: {
		'flowStore.flow.nodes': {
			handler(val, oldVal) {
				this.onTargetChanged()
			},
			deep: true,
			immediate: false,
		},
		'flowStore.flow.edges': {
			handler(val, oldVal) {
				this.onTargetChanged()
			},
			deep: true,
			immediate: false,
		},
		'flowStore.flow.name'(val, oldVal) {
			this.onTargetChanged()
		},
	},
	computed: {
		computedCanPublish() {
			// Publish sadece flow kaydedildiyse ve hata yoksa aktif
			return this.autoSaveStatus === 'saved' && !!this.flowStore?.flow?.id
		},
	},
	methods: {
		detectChanges(newVal, oldVal, path = 'flow') {
			// Performanslı değişiklik tespiti - sadece ilk seviye property'leri kontrol eder
			const changes = []

			// Primitive değer karşılaştırması
			if (typeof newVal !== 'object' || newVal === null) {
				if (newVal !== oldVal) {
					changes.push({ path, old: oldVal, new: newVal })
				}
				return changes
			}

			// Object/Array karşılaştırması (sadece 1 seviye derinlik)
			const newKeys = Object.keys(newVal)
			const oldKeys = oldVal ? Object.keys(oldVal) : []
			const allKeys = [...new Set([...newKeys, ...oldKeys])]

			allKeys.forEach((key) => {
				const newValue = newVal[key]
				const oldValue = oldVal?.[key]

				// Basit değer değişikliği
				if (typeof newValue !== 'object' || newValue === null) {
					if (newValue !== oldValue) {
						changes.push({
							path: `${path}.${key}`,
							old: oldValue,
							new: newValue,
						})
					}
				} else {
					// Object/Array için sadece referans kontrolü (performans için)
					if (newValue !== oldValue) {
						changes.push({
							path: `${path}.${key}`,
							type: Array.isArray(newValue) ? 'array' : 'object',
							changed: true,
						})
					}
				}
			})

			return changes
		},

		onTargetChanged() {
			consoleLog('AutoSaveStatus: Target changed detected. type:', this.autoSaveStatus)
			// Target değiştiğinde çağrılır

			// Eğer zaten 'changed' durumundaysa, gereksiz işlem yapma
			if (this.autoSaveStatus === 'changed') {
				consoleLog('AutoSaveStatus: Already in changed state, resetting timeout only.', this.autoSaveTimeout)
				// Sadece timeout'u yenile
				if (this.autoSaveTimeout) {
					clearTimeout(this.autoSaveTimeout)
				}
				this.autoSaveTimeout = setTimeout(() => {
					this.performAutoSave()
				}, this.debounceTime)
				return
			}

			this.autoSaveStatus = 'changed'
			consoleLog('Target changed, will auto-save in', this.debounceTime, 'ms...')

			// Status değişikliğini parent'a bildir
			this.canPublish = this.computedCanPublish

			// Önceki timeout'u temizle
			if (this.autoSaveTimeout) {
				clearTimeout(this.autoSaveTimeout)
			}

			// Debounce ile otomatik kaydet
			this.autoSaveTimeout = setTimeout(() => {
				this.performAutoSave()
			}, this.debounceTime)
		},

		performAutoSave() {
			consoleLog('Performing auto-save... Current status:', this.autoSaveStatus)
			// Otomatik kaydetme işlemi
			if (this.autoSaveStatus !== 'changed' && this.autoSaveStatus !== 'error') return
			if (this.autoSaveStatus !== 'error') {
				this.autoSaveStatus = 'saving'
			}
			this.errorLoading = true

			// Status değişikliğini parent'a bildir
			this.canPublish = this.computedCanPublish

			this.saveFunction()
				.then(() => {
					this.autoSaveStatus = 'saved'
					this.updateLastSavedTime()
				})
				.catch((e) => {
					consoleLog('Auto-save failed', e)
					this.autoSaveStatus = 'error'
				})
				.finally(() => {
					this.errorLoading = false
					this.canPublish = this.computedCanPublish
				})
		},

		updateLastSavedTime() {
			const now = new Date()
			this.lastSavedTime = now.toLocaleTimeString('tr-TR', {
				hour: '2-digit',
				minute: '2-digit',
			})
		},
	},
}
</script>
