<template>
	<table class="table">
		<thead>
			<tr>
				<th>{{ $t('components.app.content.teamSettingsTab.weightedAssignment.member') }}</th>
				<th>{{ $t('components.app.content.teamSettingsTab.weightedAssignment.frequency') }}</th>
				<th>{{ $t('components.app.content.teamSettingsTab.weightedAssignment.ratio') }}</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="teamUser in teamUsers" :key="teamUser.user.id">
				<td>{{ teamUser.user.name }}</td>
				<td>
					<NumberStepper v-model="weighted[teamUser.user.id]" :min="0" class="border border-subtle" />
					<!--					<input v-model.number="weighted[teamUser.user.id]" class="input w-15" type="number" min="0" />-->
				</td>
				<td class="w-40">
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted">{{ getPercentage(teamUser.user.id) }}%</span>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import NumberStepper from '~/components/GlobalComponents/NumberStepper.vue'

export default {
	components: { NumberStepper },
	props: {
		teamUsers: {
			type: Array,
			required: true,
		},
		weighted: {
			type: Object,
			default: () => ({}),
		},
	},
	computed: {
		totalFrequency() {
			return Object.values(this.weighted).reduce((a, b) => Number(a) + Number(b), 0)
		},
	},
	methods: {
		getPercentage(userId) {
			if (!this.totalFrequency) {
				return 0
			}
			return Math.round(((this.weighted[userId] || 0) / this.totalFrequency) * 100)
		},
	},
}
</script>