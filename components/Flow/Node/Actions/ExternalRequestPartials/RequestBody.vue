<template>
	<div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': disabled }">
		<div class="flex justify-between items-center">
			<h3 class="text-sm font-medium">Request Body</h3>
			<div v-if="disabled" class="text-xs text-warning">
				<i class="fa fa-info-circle mr-1"></i>
				{{ $t('components.flow.node.actions.externalRequestPartials.requestBody.bodyNotAvailable') }}
			</div>
			<div v-else class="flex gap-2">
				<select v-model="modelValue.bodyType" class="select select-sm select-bordered">
					<option value="form">
						Form Data
					</option>
					<option value="json">
						JSON
					</option>
					<option value="raw">
						Raw Text
					</option>
				</select>
				<button @click="addBodyField" class="btn btn-sm btn-ghost" v-if="modelValue.bodyType === 'form'">
					<i class="fa fa-plus mr-1"></i>
					{{ $t('components.flow.node.actions.externalRequestPartials.requestBody.addField') }}
				</button>
			</div>
		</div>

		<!-- Form Data -->
		<div v-if="modelValue.bodyType === 'form'" class="space-y-3">
			<div class="min-h-16" v-auto-animate>
				<div v-if="modelValue.bodyFields?.length === 0" class="text-center text-base-content/60">
					<i class="fa fa-database text-2xl mb-2"></i>
					<p class="text-sm">
						{{ $t('components.flow.node.actions.externalRequestPartials.requestBody.noFieldsAdded') }}
					</p>
				</div>

				<div v-else class="space-y-3" v-auto-animate>
					<div
						v-for="(field, index) in modelValue.bodyFields"
						:key="index"
						class="flex gap-1 items-center py-2 px-1 bg-base-200 rounded-lg"
					>
						<input
							v-model="field.key"
							type="text"
							:placeholder="$t('components.flow.node.actions.externalRequestPartials.requestBody.fieldNamePlaceholder')"
							class="input input-sm flex-1"
						/>
						<div class="relative flex items-center">
							<input
								v-model="field.value"
								type="text"
								:placeholder="
									$t('components.flow.node.actions.externalRequestPartials.requestBody.fieldValuePlaceholder')
								"
								class="input input-sm flex-1"
							/>
							<div class="absolute top-0 right-2 h-full flex items-center">
								<FieldSelector @fieldSelected="(item) => onPickField(index, item)">
									<template #triggerButton>
										<button class="btn btn-soft btn-xs">
											<span>{...}</span>
										</button>
									</template>
								</FieldSelector>
							</div>
						</div>
						<button @click="removeBodyField(index)" class="btn btn-sm btn-ghost text-error">
							<i class="fa fa-trash"></i>
						</button>
					</div>
				</div>
			</div>

			<div class="divider my-4"></div>

			<!-- Contact Information -->
			<div class="space-y-3">
				<h4 class="text-sm font-medium text-base-content/80">
					{{ $t('components.flow.node.actions.externalRequestPartials.requestBody.contactInformation') }}
				</h4>
				<div class="flex flex-wrap gap-2">
					<button
						v-for="(field, key) in recommendedFields"
						:key="key"
						@click="addContactField(field)"
						class="btn btn-xs btn-outline"
					>
						{{ $t(`components.flow.node.conditions.fields.${field.key}.name`) }}
					</button>
				</div>
			</div>
		</div>

		<!-- JSON Body -->
		<div v-else-if="modelValue.bodyType === 'json'" class="space-y-3">
			<textarea
				v-model="modelValue.jsonBody"
				placeholder='{"key": "value", "name": "{{contact.name}}"}'
				class="textarea textarea-bordered w-full h-32 font-mono text-sm"
			/>
			<div class="text-xs text-base-content/60">
				{{
					$t('components.flow.node.actions.externalRequestPartials.requestBody.jsonHint', {
						name: '\{\{contact.name\}\}',
					})
				}}
			</div>
		</div>

		<!-- Raw Text -->
		<div v-else-if="modelValue.bodyType === 'raw'" class="space-y-3">
			<textarea
				v-model="modelValue.rawBody"
				placeholder="Raw request body..."
				class="textarea textarea-bordered w-full h-32 font-mono text-sm"
			></textarea>
		</div>
	</div>
</template>

<script>
import { conditionMetadata, fieldTypes, conditionCategories } from '~/models/Flow/utils/utils.js'
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import { useFlowStore } from '~/stores/flow'

export default {
	components: { FieldSelector },
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	props: {
		modelValue: {
			type: Object,
			default: () => ({
				type: 'form',
				fields: [],
				json: '',
				raw: '',
			}),
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
	data() {
		this.modelValue.bodyFields = this.modelValue.bodyFields ?? []
		this.modelValue.bodyType = this.modelValue.bodyType ?? 'form'

		return {
			recommendedFields: conditionCategories.recommended.conditionKeys
				.map((key) => conditionMetadata[key])
				.filter((field) => [fieldTypes.STRING, fieldTypes.INTEGER].includes(field.type)),
			// recommendedFields: Object.entries(conditionMetadata)
			// 	.filter(
			// 		([key, field]) =>
			// 			field.categories.includes('recommended') && [fieldTypes.STRING, fieldTypes.INTEGER].includes(field.type),
			// 	)
			// 	.map(([key, field]) => ({ ...field, key })),
		}
	},
	methods: {
		onPickField(index, item) {
			this.modelValue.bodyFields[index].value = `{{${item.key}}}`
		},
		addBodyField() {
			this.modelValue.bodyFields.push({
				key: '',
				value: '',
			})
		},
		removeBodyField(index) {
			const fields = [...this.modelValue.bodyFields]
			fields.splice(index, 1)
			this.modelValue.bodyFields = fields
		},
		addContactField(contactField) {
			this.modelValue.bodyFields.push({
				key: contactField.key,
				value: `{{${contactField.key}}}`,
			})
		},
	},
}
</script>
