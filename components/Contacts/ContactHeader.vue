<template>
	<div class="w-full flex items-center justify-between">
		<MegaHeader
			class="bs container-fluid flex items-center z-3 justify-between w-full"
			ulClass="justify-end w-full"
			keepOpenOnClick
		>
			<template #leading>
				<h3 class="text-base">
					<span class="sm:text-lg text-base-content truncate">
						{{ $t('components.contacts.header.title') }}
					</span>
					<span v-if="total && total > 0" class="text-sm text-muted">({{ $formatNumber(total, $i18n.locale) }})</span>
				</h3>
			</template>
			<FilterList
				:selectedContactLengths="selectedContactIds.length"
				:selectionType="selectionType"
				@deselectAll="$emit('deselectAll')"
			/>
			<CustomDropdown>
				<slot name="triggerButton">
					<li>
						<button class="justify-start btn btn-ghost btn-sm w-full">
							<i class="fa fa-columns" />
							<span>{{ $t('components.contacts.header.columnsButton') }}</span>
						</button>
					</li>
				</slot>
				<template #popper>
					<div class="w-max p-4 space-y-2 max-h-100">
						<h3 class="mb-3 text-lg">{{ $t('components.contacts.header.visibleColumnsTitle') }}</h3>
						<div v-for="column in availableColumns" :key="column.key" class="form-control">
							<button
								:disabled="column.required"
								class="label cursor-pointer justify-start gap-3"
								@click="toggleColumn(column.key)"
							>
								<i
									:class="{
										'fa-eye': visibleColumns[column.key] !== false,
										'fa-eye-slash': visibleColumns[column.key] === false,
										'opacity-50': column.required,
									}"
									class="fa"
								/>
								<span
									:class="{ 'opacity-50': column.required, 'line-through': visibleColumns[column.key] === false }"
									class="label-text text-sm"
								>
									{{ column.isCustomField ? column.label : $t('components.contacts.table.columns.' + column.key) }}
								</span>
							</button>
						</div>
					</div>
				</template>
			</CustomDropdown>
			<CustomDropdown ref="exportDropdown">
				<li>
					<button class="justify-start btn btn-ghost btn-sm w-full">
						<i class="fa fa-download" />
						<span>{{ $t('components.contacts.header.exportButton') }}</span>
					</button>
				</li>
				<template #popper>
					<ul class="w-max menu">
						<li>
							<a href="javascript:" @click="exportContacts(EXPORT_TYPES.EXCEL)">
								<LoadingElement :is-loading="exportLoading === EXPORT_TYPES.EXCEL" class="w-full" :sizeRem="1">
									<i class="fa-solid fa-file-excel me-2 text-success" />
								</LoadingElement>
								{{ $t('components.contacts.export.excel') }}
							</a>
						</li>
						<li>
							<a href="javascript:" @click="exportContacts(EXPORT_TYPES.CSV)">
								<LoadingElement :is-loading="exportLoading === EXPORT_TYPES.CSV" class="w-full" :sizeRem="1">
									<i class="fa-solid fa-file-csv me-2 text-primary" />
								</LoadingElement>
								{{ $t('components.contacts.export.csv') }}
							</a>
						</li>
						<li>
							<a href="javascript:" @click="exportContacts(EXPORT_TYPES.GOOGLE_SHEETS)">
								<LoadingElement :is-loading="exportLoading === EXPORT_TYPES.GOOGLE_SHEETS" class="w-full" :sizeRem="1">
									<i class="fa-solid fa-table me-2 text-warning" />
								</LoadingElement>

								{{ $t('components.contacts.export.googleSheets') }}
							</a>
						</li>
					</ul>
				</template>
			</CustomDropdown>
		</MegaHeader>
	</div>
</template>

<script>
import MegaHeader from '~/components/BaseComponents/Header/MegaHeader.vue'
import SelectedAccount from '~/components/Chat/Sidebar/SelectedAccount.vue'
import { DEFAULT_COLUMNS, SELECTION_TYPES } from '~/models/Contact/Contact.js'
import FilterList from '~/components/Contacts/FilterList.vue'
import apiList from '~/apis/ApiList.js'
import FilterMixin from '~/mixins/FilterMixin.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

const EXPORT_TYPES = {
	EXCEL: 'excel',
	CSV: 'csv',
	GOOGLE_SHEETS: 'sheets',
}
export default {
	mixins: [FilterMixin],
	components: {
		CustomDropdown,
		LoadingElement,
		FilterList,
		SelectedAccount,
		MegaHeader,
	},
	props: {
		visibleColumns: {
			type: Object,
			required: true,
		},
		selectedContactIds: {
			type: Array,
			default: () => [],
		},
		selectionType: {
			type: String,
			default: SELECTION_TYPES.INCLUDE,
		},
	},
	emits: ['searchInput', 'toggleColumn', 'deselectAll'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			contactsStore: useContactsStore(),
		}
	},
	data() {
		return {
			EXPORT_TYPES,
			exportLoading: null,
		}
	},
	computed: {
		availableColumns() {
			const baseColumns = [
				DEFAULT_COLUMNS.FIRST_NAME,
				DEFAULT_COLUMNS.LAST_NAME,
				DEFAULT_COLUMNS.USERNAME,
				DEFAULT_COLUMNS.EMAIL,
				DEFAULT_COLUMNS.NOTES,
				DEFAULT_COLUMNS.ADDRESS,
				DEFAULT_COLUMNS.PHONE,
				DEFAULT_COLUMNS.TIMEZONE,
			]

			let customFields = []
			if (this.chatAccountsStore.active?.id) {
				customFields = this.chatAccountsStore.active.customFields
			} else {
				customFields = Object.values(this.chatAccountAttributesStore.customFields).flat()
			}

			const customFieldColumns = customFields
				.filter((cf, i, arr) => arr.findIndex((x) => x.key === cf.key) === i)
				.map((cf) => ({
					key: `custom.${cf.key}`,
					required: false,
					label: cf.key,
					isCustomField: true,
				}))

			return [...baseColumns, ...customFieldColumns]
		},
		total() {
			return this.contactsStore.currentScopeSlice?.total ?? 0
		},
	},
	methods: {
		toggleColumn(key) {
			this.$emit('toggleColumn', key)
		},
		exportContacts(type) {
			if (this.exportLoading) return
			this.exportLoading = type

			const chatAccountId = this.chatAccountsStore.active?.id
			const query = this.$route?.query || {}
			const search = (query.search || '').toString().trim()
			const filters = this.getActiveFiltersFromRoute()

			const columns = Object.keys(this.visibleColumns).filter((key) => this.visibleColumns[key])

			const payload = {
				chatAccountId,
				export: type,
				contactIds: this.selectedContactIds,
				selectionType: this.selectionType,
				columns,
				search,
				filters,
			}

			const extensionMap = { excel: 'xlsx', csv: 'csv', google_sheets: 'xlsx' }
			const filename = `contacts-${new Date().toISOString().slice(0, 10)}.${extensionMap[type] || 'xlsx'}`
			let responseTye = 'blob'
			if (type === EXPORT_TYPES.GOOGLE_SHEETS) {
				responseTye = null
			}
			this.$requestAdapter
				.post(apiList.chat.instagram.contacts.export, payload, {
					responseType: responseTye,
				})
				.then((response) => {
					if (!response) return
					if (type === EXPORT_TYPES.GOOGLE_SHEETS) {
						window.open(response.data.auth_url, '_blank')
						return
					}
					const downloadUrl = window.URL.createObjectURL(response)
					const link = document.createElement('a')
					link.download = filename
					link.href = downloadUrl
					link.click()
					window.URL.revokeObjectURL(downloadUrl)
				})
				.catch((error) => {
					consoleLog('Export contacts error:', error)
				})
				.finally(() => {
					this.exportLoading = null
					this.$refs.exportDropdown.hide()
				})
		},
	},
}
</script>

<style scoped></style>
