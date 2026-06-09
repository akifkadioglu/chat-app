<template>
	<div>
		<!--		<Teleport :to="summaryRefElement" v-if="summaryRefElement && isConfigured">-->
		<div class="flex items-baseline gap-2 mb-4">
			<i class="fa fa-clock mr-1"></i>
			<div class="text-sm">
				<!-- Duration Summary -->
				<span v-if="node.config.delayType === 'duration' && node.config.delayTime">
					{{
						$t('components.flow.node.actions.delay.wait', {
							time: node.config.delayTime,
							unit: getUnitLabel(node.config.delayUnit),
						})
					}}
					<br />
					<span
						v-if="node.config.continueIf && node.config.continueWeekdays && node.config.continueWeekdays.length > 0"
					>
						<span>{{ $t('components.flow.node.actions.delay.or') }}</span>
						<span v-if="node.config.continueWeekdays.length > 6">
							{{ $t('components.flow.node.actions.delay.everyDay') }}
						</span>
						<span v-else>
							<!--							{{ $t('components.flow.node.actions.delay.days') }}-->
						</span>

						<i18n-t keypath="components.flow.node.actions.delay.continueOnDays">
							<template #days>
								<span
									v-for="(day, index) in node.config.continueWeekdays"
									:key="day"
									class="badge badge-sm badge-primary mr-1"
								>
									{{ weekdays.find((d) => d.value === day)?.label }}
								</span>
							</template>

							<template #startHour> {{ formatHour(node.config.continueStartHour) }} </template>
							<template #endHour> {{ formatHour(node.config.continueEndHour) }} </template>
						</i18n-t>
					</span>
				</span>

				<!-- DateTime Summary -->
				<span v-else-if="node.config.delayType === 'datetime' && node.config.targetDateTime">
					{{
						$t('components.flow.node.actions.delay.waitUntil', {
							dateTime: formatDateTime(new Date(node.config.targetDateTime)),
						})
					}}
				</span>
			</div>
		</div>
		<!--		</Teleport>-->

		<div class="flex flex-col gap-5">
			<!-- Type Selection -->
			<div class="flex gap-4">
				<label class="cursor-pointer">
					<input
						v-model="node.config.delayType"
						type="radio"
						value="duration"
						class="radio radio-primary radio-sm mr-1"
					/>
					<span class="text-sm">{{ $t('components.flow.node.actions.delay.duration') }}</span>
				</label>
				<label class="cursor-pointer">
					<input
						v-model="node.config.delayType"
						type="radio"
						value="datetime"
						class="radio radio-primary radio-sm mr-1"
					/>
					<span class="text-sm">{{ $t('components.flow.node.actions.delay.datetime') }}</span>
				</label>
			</div>

			<!-- Duration Settings -->
			<template v-if="node.config.delayType === 'duration'">
				<div class="flex gap-3">
					<input
						v-model.number="node.config.delayTime"
						type="number"
						min="1"
						class="input w-24"
						:placeholder="$t('components.flow.node.actions.delay.enterDuration')"
					/>
					<select v-model="node.config.delayUnit" class="select w-32">
						<option value="seconds">{{ $t('components.flow.node.actions.delay.seconds') }}</option>
						<option value="minutes">{{ $t('components.flow.node.actions.delay.minutes') }}</option>
						<option value="hours">{{ $t('components.flow.node.actions.delay.hours') }}</option>
					</select>
				</div>

				<!-- Continue if checkbox -->
				<div>
					<label class="cursor-pointer justify-start gap-3">
						<input v-model="node.config.continueIf" class="checkbox checkbox-sm mr-1" type="checkbox" />
						<span class="text-sm">{{ $t('components.flow.node.actions.delay.continueOnSpecificDays') }}</span>
					</label>
				</div>
				<!-- Continue if weekdays -->
				<div v-if="node.config.continueIf" class="relative">
					<div class="my-3">
						<div class="text-sm font-medium">{{ $t('components.flow.node.actions.delay.noWaitTimeRange') }}</div>
						<div class="text-sm">
							<i class="fa fa-info-circle text-info" />
							{{ $t('components.flow.node.actions.delay.timeRangeInfo') }}
						</div>
					</div>

					<div class="flex items-center gap-4 mb-4">
						<div class="text-sm font-medium">
							{{ $t('components.flow.node.actions.delay.timeRange') }}
						</div>
						<div class="flex gap-3 mt-2 items-center">
							<select v-model="node.config.continueStartHour" class="select select-bordered w-24">
								<option v-for="hour in hours" :key="hour" :value="hour">
									{{ hour.toString().padStart(2, '0') }}:00
								</option>
							</select>
							<span class="text-sm">-</span>
							<select v-model="node.config.continueEndHour" class="select select-bordered w-24">
								<option v-for="hour in hours" :key="hour" :value="hour">
									{{ hour.toString().padStart(2, '0') }}:00
								</option>
							</select>
						</div>
					</div>

					<div class="flex items-center gap-4">
						<div>
							<span class="text-sm font-medium">{{ $t('components.flow.node.actions.delay.daysLabel') }} </span>
						</div>

						<CustomDropdown>
							<span class="text-sm cursor-pointer">{{ selectedWeekdaysText }}</span>
							<template #popper="{ shown }">
								<div v-if="shown" class="bg-base-100 rounded-box p-3">
									<div class="grid grid-cols-1 gap-2">
										<label
											v-for="day in weekdays"
											:key="day.value"
											class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
										>
											<input
												v-model="node.config.continueWeekdays"
												:value="day.value"
												class="checkbox checkbox-sm"
												type="checkbox"
											/>
											<span class="text-sm">{{ day.label }}</span>
										</label>
									</div>
									<div class="divider my-0"></div>
									<div class="flex gap-2">
										<button class="btn btn-sm btn-ghost" @click="selectAllDays">
											{{ $t('components.flow.node.actions.delay.selectAll') }}
										</button>
										<button class="btn btn-sm btn-ghost" @click="clearAllDays">
											{{ $t('components.flow.node.actions.delay.clear') }}
										</button>
									</div>
								</div>
							</template>
						</CustomDropdown>
					</div>
				</div>
			</template>

			<!-- Date/Time Settings -->
			<template v-if="node.config.delayType === 'datetime'">
				<label>
					<span class="text-sm font-medium">{{ $t('components.flow.node.actions.delay.targetDateTime') }}</span>
				</label>
				<div class="flex gap-3 mt-2">
					<input v-model="targetDate" type="date" class="input w-40" />
					<input v-model="targetTime" type="time" class="input w-32" />
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown },
	props: {
		node: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			weekdays: [
				{ value: 1, label: this.$t('components.flow.node.actions.delay.weekdays.monday') },
				{ value: 2, label: this.$t('components.flow.node.actions.delay.weekdays.tuesday') },
				{ value: 3, label: this.$t('components.flow.node.actions.delay.weekdays.wednesday') },
				{ value: 4, label: this.$t('components.flow.node.actions.delay.weekdays.thursday') },
				{ value: 5, label: this.$t('components.flow.node.actions.delay.weekdays.friday') },
				{ value: 6, label: this.$t('components.flow.node.actions.delay.weekdays.saturday') },
				{ value: 0, label: this.$t('components.flow.node.actions.delay.weekdays.sunday') },
			],
			hours: Array.from({ length: 24 }, (_, i) => i),
		}
	},
	computed: {
		selectedWeekdaysText() {
			if (!this.node.config.continueWeekdays || this.node.config.continueWeekdays.length === 0) {
				return this.$t('components.flow.node.actions.delay.selectDay')
			}

			if (this.node.config.continueWeekdays.length === 7) {
				return this.$t('components.flow.node.actions.delay.everyDay')
			}

			const selectedDays = this.node.config.continueWeekdays
				.map((dayValue) => this.weekdays.find((day) => day.value === dayValue)?.label)
				.filter(Boolean)
				.join(', ')

			return selectedDays || this.$t('components.flow.node.actions.delay.selectDay')
		},
		targetDate: {
			get() {
				if (!this.node.config.targetDateTime) return ''
				const date = new Date(this.node.config.targetDateTime)
				return date.toISOString().split('T')[0]
			},
			set(value) {
				if (!value) return
				const currentTime = this.node.config.targetDateTime
					? new Date(this.node.config.targetDateTime).toTimeString().slice(0, 5)
					: '12:00'
				this.updateDateTimeFromInputs('target', value, currentTime)
			},
		},
		targetTime: {
			get() {
				if (!this.node.config.targetDateTime) return ''
				const date = new Date(this.node.config.targetDateTime)
				return date.toTimeString().slice(0, 5)
			},
			set(value) {
				if (!value) return
				const currentDate = this.node.config.targetDateTime
					? new Date(this.node.config.targetDateTime).toISOString().split('T')[0]
					: new Date().toISOString().split('T')[0]
				this.updateDateTimeFromInputs('target', currentDate, value)
			},
		},
	},
	mounted() {
		// Initialize default values
		// if (!this.node.config.delayType) {
		// 	this.node.config.delayType = 'duration'
		// }
		// if (!this.node.config.delayTime) {
		// 	this.node.config.delayTime = 5
		// }
		// if (!this.node.config.delayUnit) {
		// 	this.node.config.delayUnit = 'minutes'
		// }
		// if (!this.node.config.continueWeekdays) {
		// 	this.node.config.continueWeekdays = []
		// }
		// if (this.node.config.continueStartHour === undefined) {
		// 	this.node.config.continueStartHour = 9
		// }
		// if (this.node.config.continueEndHour === undefined) {
		// 	this.node.config.continueEndHour = 17
		// }
	},
	methods: {
		getUnitLabel(unit) {
			switch (unit) {
				case 'seconds':
					return this.$t('components.flow.node.actions.delay.units.seconds')
				case 'minutes':
					return this.$t('components.flow.node.actions.delay.units.minutes')
				case 'hours':
					return this.$t('components.flow.node.actions.delay.units.hours')
				default:
					return unit
			}
		},
		formatDateTime(date) {
			return date.toLocaleString('tr-TR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		},
		formatHour(hour) {
			return hour.toString().padStart(2, '0') + ':00'
		},
		updateDateTimeFromInputs(type, dateValue, timeValue) {
			if (!dateValue || !timeValue) return

			const dateTimeString = `${dateValue}T${timeValue}:00`
			const dateTime = new Date(dateTimeString)

			if (type === 'target') {
				this.node.config.targetDateTime = dateTime.toISOString()
			}
		},
		selectAllDays() {
			this.node.config.continueWeekdays = this.weekdays.map((day) => day.value)
		},
		clearAllDays() {
			this.node.config.continueWeekdays = []
		},
	},
}
</script>
