<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.summaries.pauseFlows.title') }}</h4>
		<p class="text-xs text-muted">
			{{
				$t('components.flow.node.actions.pauseFlows.durationDescription', {
					duration: $t('components.flow.node.actions.pauseFlows.duration', {
						value: processedValue,
						unit: $t('components.flow.node.actions.pauseFlows.units.' + processedUnit),
					}),
				})
			}}
		</p>
	</div>
</template>
<script>
const UNITS = {
	MINUTES: 'minutes',
	HOURS: 'hours',
	DAYS: 'days',
	FOREVER: 'forever',
}

export default {
	props: {
		node: {
			type: Object,
			required: true,
		},
	},
	computed: {
		processedValue() {
			if (!this.node.config.duration || this.node.config.isForever) return

			const minutes = this.node.config.duration
			const days = Math.floor(minutes / (24 * 60))
			const hours = Math.floor((minutes % (24 * 60)) / 60)
			const remainingMinutes = minutes % 60

			if (days > 0) return days
			if (hours > 0) return hours
			return remainingMinutes
		},
		processedUnit() {
			if (!this.node.config.duration || this.node.config.isForever) return UNITS.FOREVER

			const minutes = this.node.config.duration
			const days = Math.floor(minutes / (24 * 60))
			const hours = Math.floor((minutes % (24 * 60)) / 60)

			if (days > 0) return UNITS.DAYS
			if (hours > 0) return UNITS.HOURS
			return UNITS.MINUTES
		},
	},
}
</script>

<style scoped></style>
