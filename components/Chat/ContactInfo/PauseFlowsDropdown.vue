<template>
	<CustomDropdown :placement="placement">
		<slot name="trigger">
			<button class="btn btn-sm btn-ghost gap-2">
				<i class="fa fa-pause" />
				{{ $t('components.chat.contactInfo.contactInfoContent.flowsPause.button') }}
			</button>
		</slot>
		<template #popper="{ hide }">
			<ul class="menu">
				<li v-for="option in pauseDurationOptions" :key="option.value">
					<a @click="pauseFlows(option.value, hide)">
						{{ option.label }}
					</a>
				</li>
			</ul>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown },
	props: {
		placement: {
			type: String,
			default: 'bottom',
		},
	},
	emits: ['pauseFlows'],
	data() {
		return {
			pauseDurationOptions: [
				{ value: 10, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.10min') },
				{ value: 30, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.30min') },
				{ value: 60, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.1hour') },
				{ value: 180, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.3hours') },
				{ value: 360, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.6hours') },
				{ value: 1440, label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.24hours') },
				{ value: "forever", label: this.$t('components.chat.contactInfo.contactInfoContent.flowsPause.options.forever') },
			],
		}
	},
	methods: {
		pauseFlows(durationMinutes, hideDropdownFunc) {
			hideDropdownFunc()
			this.$emit('pauseFlows', durationMinutes)
		},
	},
}
</script>

<style scoped></style>
