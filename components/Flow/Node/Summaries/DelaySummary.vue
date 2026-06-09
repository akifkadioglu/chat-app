<template>
	<div class="flex items-baseline gap-2">
		<i class="fa fa-clock mr-1"></i>
		<!-- Duration Summary -->
		<span v-if="node.config.delayType === 'duration' && node.config.delayTime">
			{{
				$t('components.flow.node.actions.delay.wait', {
					time: node.config.delayTime,
					unit: getUnitLabel(node.config.delayUnit),
				})
			}}
			<br />
			<span v-if="node.config.continueIf && node.config.continueWeekdays && node.config.continueWeekdays.length > 0">
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
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
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
		}
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
	},
}
</script>
