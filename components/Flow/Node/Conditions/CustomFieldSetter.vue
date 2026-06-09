<template>
	<div class="space-y-3 w-full">
		<input
			v-model="newField.key"
			type="text"
			:placeholder="$t('components.flow.node.conditions.fieldSelector.fieldNamePlaceholder')"
			class="input input-bordered w-full"
			@keyup.enter="create"
			@click.stop
			ref="newCustomFieldInput"
		/>

		<div class="grid grid-cols-2 gap-2">
			<label
				v-for="fieldType in availableFieldTypes"
				:key="fieldType.value"
				class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-base-200 transition-colors"
				@click.stop
			>
				<input
					v-model="newField.type"
					type="radio"
					:value="fieldType.value"
					class="radio radio-primary radio-xs"
					@click.stop
				/>
				<span class="text-xs">{{ fieldType.label }}</span>
			</label>
		</div>

		<slot />

		<div class="flex items-center gap-2 justify-end">
			<span @click.prevent.stop="cancel" class="btn btn-sm btn-ghost">
				{{ $t('components.flow.node.conditions.fieldSelector.cancelButton') }}
			</span>
			<button @click.prevent.stop="create" :disabled="isLoading" class="btn btn-sm btn-primary">
				<LoadingElement :isLoading="isLoading" size="15">
					<i class="fa fa-plus" />
				</LoadingElement>
				{{ $t('components.flow.node.conditions.fieldSelector.addButton') }}
			</button>
		</div>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { fieldTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: { LoadingElement },
	props: {
		newField: {
			type: Object,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['cancel', 'create'],
	computed: {
		availableFieldTypes() {
			return [
				{ value: fieldTypes.STRING, label: this.$t('components.flow.node.conditions.fieldSelector.fieldTypes.string') },
				{
					value: fieldTypes.INTEGER,
					label: this.$t('components.flow.node.conditions.fieldSelector.fieldTypes.integer'),
				},
				{ value: fieldTypes.BOOL, label: this.$t('components.flow.node.conditions.fieldSelector.fieldTypes.bool') },
				{ value: fieldTypes.DATE, label: this.$t('components.flow.node.conditions.fieldSelector.fieldTypes.date') },
			]
		},
	},
	methods: {
		create() {
			this.$emit('create')
		},
		cancel() {
			this.$emit('cancel')
		},
	},
}
</script>

<style scoped></style>
