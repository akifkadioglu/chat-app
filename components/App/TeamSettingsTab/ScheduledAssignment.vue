<template>
	<div class="space-y-4">
		<div v-for="teamUser in teamUsers" :key="teamUser.user.id" class="border border-base-300 rounded-lg p-4">
			<div class="flex items-center justify-between mb-3">
				<span class="font-medium">{{ teamUser.user.name }}</span>
				<label class="label cursor-pointer gap-2">
					<span class="text-sm text-muted">{{ $t('components.accounts.settingsTab.teamSettings.alwaysAvailable')}}</span>
					<input
						type="checkbox"
						class="toggle toggle-primary toggle-sm"
						v-model="scheduled[teamUser.user.id].alwaysAvailable"
					/>
				</label>
			</div>
			<div v-if="!scheduled[teamUser.user.id]?.alwaysAvailable" class="flex flex-wrap gap-x-4 gap-y-1">
				<label v-for="day in DAYS" :key="day.key" class="label cursor-pointer gap-2">
					<input
						type="checkbox"
						class="checkbox checkbox-sm"
						v-model="scheduled[teamUser.user.id].days[day.key].enabled"
					/>
					<span class="text-sm">{{ $t('components.accounts.settingsTab.teamSettings.days.' + day.key) }}</span>
				</label>
			</div>
			<div v-if="!scheduled[teamUser.user.id]?.alwaysAvailable" class="mt-4 space-y-2">
				<template v-for="day in DAYS" :key="day.key + '-time'">
					<div
						v-if="scheduled[teamUser.user.id]?.days[day.key]?.enabled"
						class="flex items-center gap-3 p-2 bg-base-200 rounded-lg"
					>
						<span class="text-sm font-medium w-30 truncate">
							{{ $t('components.accounts.settingsTab.teamSettings.days.' + day.key) }}
						</span>
						<label class="label cursor-pointer gap-2 mr-auto">
							<span class="text-sm text-muted">Saat aralığı belirle</span>
							<input
								type="checkbox"
								class="toggle toggle-sm toggle-primary"
								v-model="scheduled[teamUser.user.id].days[day.key].customTime"
							/>
						</label>
						<template v-if="scheduled[teamUser.user.id].days[day.key].customTime">
							<input
								type="time"
								class="input input-sm w-28"
								v-model="scheduled[teamUser.user.id].days[day.key].start"
							/>
							<span class="text-muted">-</span>
							<input type="time" class="input input-sm w-28" v-model="scheduled[teamUser.user.id].days[day.key].end" />
						</template>
						<span v-else class="text-sm text-muted py-1">Tüm gün</span>
					</div>
				</template>
			</div>
			<div v-else class="text-sm text-muted">Bu kullanıcı her zaman müsait</div>
		</div>
	</div>
</template>

<script>
const DAYS = [
	{ key: 'monday' },
	{ key: 'tuesday' },
	{ key: 'wednesday' },
	{ key: 'thursday' },
	{ key: 'friday' },
	{ key: 'saturday' },
	{ key: 'sunday' },
]

export default {
	props: {
		teamUsers: {
			type: Array,
			required: true,
		},
		scheduled: {
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return { DAYS }
	},
}
</script>
