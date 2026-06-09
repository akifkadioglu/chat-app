<template>
	<CustomDropdown ref="dropdown" placement="right-end">
		<slot name="trigger" />
		<template #popper>
			<div class="p-3 w-85 space-y-2">
				<TagBadgeList showSearch :tags="allTags" :selectedTagIds="selectedTagIds" @toggleTag="toggleTag">
					<div v-if="newTags.length > 0" class="flex flex-wrap gap-2 my-2">
						<div
							v-for="(tag, index) in newTags"
							:key="'newTag-' + index"
							class="badge badge-sm gap-1 cursor-pointer"
							:style="{ backgroundColor: tag.color + '90' }"
							@click="newTags.splice(index, 1)"
						>
							{{ tag.name }}
							<i class="fa fa-times text-xs" />
						</div>
					</div>
				</TagBadgeList>
				<button
					class="btn btn-sm btn-soft btn-primary w-full"
					:disabled="(selectedTagIds.length === 0 && newTags.length === 0) || isLoading"
					@click="addTags"
				>
					<LoadingElement :isLoading="isLoading" size="20">
						<i class="fa fa-plus" />
					</LoadingElement>
					<span>{{ $t('components.contacts.footer.dropdowns.add') }}</span>
				</button>
				<Collapse
					showArrow
					:open="allTags.length === 0"
					:title="$t('components.contacts.footer.dropdowns.createNewTag')"
				>
					<TagSetter :newTag="newTag" @createTag="createTag" :isLoading="createTagLoading" />
				</Collapse>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import TagBadgeList from '~/components/Chat/ContactInfo/Partials/TagBadgeList.vue'
import TagSetter from '~/components/Chat/ContactInfo/Partials/TagSetter.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'

export default {
	components: { CustomDropdown, TagBadgeList, TagSetter, LoadingElement, Collapse },
	props: {
		selectedContactIds: {
			type: Array,
			default: () => [],
		},
		selectionType: {
			type: String,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['done', 'update:isLoading'],
	setup() {
		return {
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			chatAccountsStore: useChatAccountsStore(),
			contactsStore: useContactsStore(),
		}
	},
	data() {
		return {
			selectedTagIds: [],
			newTags: [],
			newTag: {
				color: DEFAULT_TAG_COLOR,
				name: '',
			},
			createTagLoading: false,
		}
	},
	mounted() {
		const activeId = this.chatAccountsStore.active?.id
		if (activeId) {
			this.chatAccountAttributesStore.fetchTags(activeId)
		}
	},
	computed: {
		rawTags() {
			if (this.chatAccountsStore.active?.id) {
				return this.chatAccountAttributesStore.getTagsByChatAccountId(this.chatAccountsStore.active.id)
			}
			return Object.values(this.chatAccountAttributesStore.tags).flat()
		},
		allTags() {
			const grouped = {}
			this.rawTags.forEach((tag) => {
				const key = `${tag.name}__${tag.color}`
				if (!grouped[key]) {
					grouped[key] = { ...tag, groupedIds: [tag.id] }
				} else {
					grouped[key].groupedIds.push(tag.id)
				}
			})
			return Object.values(grouped)
		},
	},
	methods: {
		hide() {
			this.$refs.dropdown?.hide()
		},
		toggleTag(tag) {
			const idsToToggle = tag.groupedIds || [tag.id]
			const isSelected = idsToToggle.some((id) => this.selectedTagIds.includes(id))
			if (isSelected) {
				idsToToggle.forEach((id) => {
					const index = this.selectedTagIds.indexOf(id)
					if (index !== -1) this.selectedTagIds.splice(index, 1)
				})
				return
			}
			idsToToggle.forEach((id) => {
				if (!this.selectedTagIds.includes(id)) this.selectedTagIds.push(id)
			})
		},
		createTag() {
			if (!this.newTag.name) return
			this.newTags.push({ ...this.newTag })
			this.newTag = {
				color: DEFAULT_TAG_COLOR,
				name: '',
			}
		},
		getConfirmText() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			let count = this.selectedContactIds.length
			if (this.selectionType === 'exclude') {
				count = total - this.selectedContactIds.length
			}

			const existingTags = this.allTags
				.filter(
					(t) => this.selectedTagIds.includes(t.id) || t.groupedIds?.some((id) => this.selectedTagIds.includes(id)),
				)
				.map((t) => t.name)
			const tagNames = [...existingTags, ...this.newTags.map((t) => t.name)]
			const tags = tagNames.join(', ')

			let tagLabel = this.$t('components.contacts.bulkActions.addTag.singular')
			if (tagNames.length > 1) {
				tagLabel = this.$t('components.contacts.bulkActions.addTag.plural')
			}

			return this.$t('components.contacts.bulkActions.addTag.description', { count, tags, tagLabel })
		},
		async addTags() {
			if ((this.selectedTagIds.length === 0 && this.newTags.length === 0) || this.isLoading) return

			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.addTag.title'),
				text: this.getConfirmText(),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return

			this.$emit('update:isLoading', true)

			this.contactsStore
				.createTagBulkRequest(
					this.selectedContactIds,
					this.selectionType,
					this.chatAccountsStore.active?.id,
					this.selectedTagIds,
					this.newTags,
				)
				.then(() => {
					this.selectedTagIds = []
					this.newTags = []
					this.$refs.dropdown?.hide()
					this.$emit('done')
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.$emit('update:isLoading', false)
				})
		},
	},
}
</script>
