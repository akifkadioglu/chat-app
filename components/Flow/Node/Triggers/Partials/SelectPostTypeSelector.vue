<template>
	<div class="flex items-center gap-2">
		<CustomDropdown>
			<button ref="dropdownButton" class="btn btn-soft btn-base-200 w-full justify-between">
				<span class="flex items-center gap-2">
					<i :class="selectedOption.icon"></i>
					{{ selectedOption.title }}
				</span>
				<i class="fa fa-chevron-down fa-xs"></i>
			</button>
			<template #popper="{ shown, hide }">
				<div v-if="shown" class="bg-base-100 shadow-lg rounded-box p-2">
					<ul class="menu gap-1">
						<li v-for="option in options" :key="option.value">
							<a
								href="javascript:"
								class="py-3 text-nowrap w-full"
								:class="{ 'menu-active': modelValue === option.value }"
								@click="
									() => {
										selectOption(option.value)
										hide()
									}
								"
							>
								<div class="flex-1">
									<div class="flex items-center gap-3">
										<i :class="option.icon"></i>
										<span class="font-medium">{{ option.title }}</span>
									</div>
									<p class="text-xs text-base-content/70 mt-1">{{ option.description }}</p>
								</div>
								<i v-if="modelValue === option.value" class="fa fa-check ml-auto"></i>
							</a>
						</li>
					</ul>
				</div>
			</template>
		</CustomDropdown>
		<loading-element :is-loading="isLastPostLoading" />
	</div>
</template>

<script>
import { CommentOnPostType } from '~/models/Flow/utils/utils.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown, LoadingElement },
	props: {
		modelValue: {
			type: String,
			required: true,
		},
		isLastPostLoading: {},
		options: {
			type: Array,
			default: () => [
				{
					value: '',
					title: 'title',
					description: 'description',
					icon: 'fa fa-thumbtack',
				},
			],
		},
	},
	emits: ['update:modelValue'],
	computed: {
		CommentOnPostType() {
			return CommentOnPostType
		},
		selectedOption() {
			return this.options.find((option) => option.value === this.modelValue) || this.options[0]
		},
	},
	methods: {
		selectOption(value) {
			this.$emit('update:modelValue', value)
		},
		closeDropdown() {
			if (typeof document !== 'undefined' && document.activeElement) {
				document.activeElement.blur()
			}
		},
	},
}
</script>
