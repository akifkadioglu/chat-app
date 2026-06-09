<template>
	<CustomDropdown placement="bottom-end">
		<button :id="id" class="btn btn-outline w-full justify-between">
			<span>{{ selectedTimezone?.city }}</span>
			<span class="text-muted">{{ selectedTimezone?.gmt }}</span>
		</button>

		<template #popper="{ hide }">
			<div class="menu w-80 p-2">
				<div>
					<input
						v-model="timezoneSearch"
						type="text"
						class="input input-bordered input-sm w-full mb-2"
						:placeholder="$t('common.search')"
					/>
					<div class="max-h-72 overflow-y-auto">
						<ul class="p-0">
							<li v-for="tz in filteredTimezones" :key="tz.identifier">
								<a @click="selectTimezone(tz, hide)" class="flex justify-between">
									<span> {{ tz.city }} </span>
									<span class="text-muted font-medium shrink-0">({{ tz.gmt }})</span>
								</a>
							</li>
							<li v-if="filteredTimezones.length === 0">
								<span class="text-muted">{{ $t('common.noResults') }}</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { getTimezones } from '~/helpers/timezones.js'

export default {
	name: 'TimezoneDropdown',
	components: { CustomDropdown },
	props: {
		id: {
			type: String,
			default: '',
		},
		selectedTimezone: {
			type: Object,
			default: null,
		},
	},
	emits: ['update:selectedTimezone'],
	data() {
		return {
			timezones: [],
			timezoneSearch: '',
		}
	},
	computed: {
		filteredTimezones() {
			if (!this.timezoneSearch) return this.timezones
			const search = this.timezoneSearch.toLowerCase()
			return this.timezones.filter(
				(tz) => tz.city.toLowerCase().includes(search) || tz.gmt.toLowerCase().includes(search),
			)
		},
	},
	mounted() {
		this.timezones = getTimezones()
	},
	methods: {
		selectTimezone(timezone, hideDropdownFunc) {
			this.$emit('update:selectedTimezone', timezone)
			this.timezoneSearch = ''
			hideDropdownFunc()
		},
	},
}
</script>

<style scoped></style>
