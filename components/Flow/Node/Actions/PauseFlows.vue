<template>
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h3 class="font-semibold text-base-content">{{ $t('components.flow.node.actions.pauseFlows.title') }}</h3>
			<p class="text-xs text-muted">
				{{ $t('components.flow.node.actions.pauseFlows.description') }}
			</p>
		</div>

		<!-- Duration Selection -->
		<div>
			<label class="label">
				<span class="label-text font-medium">{{ $t('components.flow.node.actions.pauseFlows.selectDuration') }}</span>
				<CustomDropdown>
					<button class="btn btn-soft w-full justify-between btn-sm">
						{{
							$t('components.flow.node.actions.pauseFlows.dropdownUnits.' + processedUnit(node.config.duration), {
								count: processedValue(node.config.duration),
							})
						}}
						<i class="fa fa-chevron-down text-xs"></i>
					</button>
					<template #popper="{ hide }">
						<div class="bg-base-100">
							<ul class="menu">
								<li v-for="option in durations" :key="option">
									<a @click="selectOption(option, hide)">
										{{
											$t('components.flow.node.actions.pauseFlows.dropdownUnits.' + processedUnit(option), {
												count: processedValue(option),
											})
										}}
									</a>
								</li>
							</ul>
						</div>
					</template>
				</CustomDropdown>
			</label>
		</div>

		<div class="alert alert-info alert-soft p-4">
			<i class="fa fa-info-circle" />
			<i18n-t tag="p" keypath="components.flow.node.actions.pauseFlows.durationDescription">
				<template #duration>
					<b>
						<i18n-t keypath="components.flow.node.actions.pauseFlows.duration">
							<template #value>{{ processedValue(node.config.duration) }}</template>
							<template #unit>
								{{ $t('components.flow.node.actions.pauseFlows.units.' + processedUnit(node.config.duration)) }}
							</template>
						</i18n-t>
					</b>
				</template>
			</i18n-t>
		</div>
	</div>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { Node } from '~/models/Flow/Node.ts'

const UNITS = {
	FOREVER: 'forever',
	MINUTES: 'minutes',
	HOURS: 'hours',
	DAYS: 'days',
}

export default {
	name: 'PauseFlow',
	components: { CustomDropdown },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	data() {
		return {
			UNITS,
			durations: [30, 60, 3 * 60, 6 * 60, 12 * 60, 24 * 60, UNITS.FOREVER],
		}
	},
	computed: {
		processedValue() {
			return (option) => {
				if (!option || option === UNITS.FOREVER) return

				const minutes = option
				const days = Math.floor(minutes / (24 * 60))
				const hours = Math.floor((minutes % (24 * 60)) / 60)
				const remainingMinutes = minutes % 60

				if (days > 0) return days
				if (hours > 0) return hours
				return remainingMinutes
			}
		},
		processedUnit() {
			return (option) => {
				if (!option || option === UNITS.FOREVER) return UNITS.FOREVER

				const minutes = option
				const days = Math.floor(minutes / (24 * 60))
				const hours = Math.floor((minutes % (24 * 60)) / 60)

				if (days > 0) return UNITS.DAYS
				if (hours > 0) return UNITS.HOURS
				return UNITS.MINUTES
			}
		},
	},
	mounted() {},
	methods: {
		selectOption(option, hide) {
			this.node.config.duration = option
			hide()
		},
	},
}
</script>
