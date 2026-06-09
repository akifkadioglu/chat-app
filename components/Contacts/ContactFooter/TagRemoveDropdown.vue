<template>
	<CustomDropdown ref="dropdown" placement="right-end">
		<slot name="trigger" />
		<template #popper>
			<div class="p-3 w-85">
				<TagBadgeList showSearch :tags="allTags" :selectedTagIds="selectedTagIds" @toggleTag="toggleTag" />
				<button
					class="btn btn-sm btn-soft btn-error w-full mt-2"
					:disabled="selectedTagIds.length === 0 || isLoading"
					@click="removeTags"
				>
					<span>
						<LoadingElement :isLoading="isLoading" size="20">
							<i class="fa fa-trash" />
						</LoadingElement>
						<span>{{ $t('components.contacts.footer.dropdowns.delete') }}</span>
					</span>
				</button>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import TagBadgeList from '~/components/Chat/ContactInfo/Partials/TagBadgeList.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { CustomDropdown, TagBadgeList, LoadingElement },
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
		getConfirmText() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			let count = this.selectedContactIds.length
			if (this.selectionType === 'exclude') {
				count = total - this.selectedContactIds.length
			}

			const tagNames = this.allTags
				.filter(
					(t) => this.selectedTagIds.includes(t.id) || t.groupedIds?.some((id) => this.selectedTagIds.includes(id)),
				)
				.map((t) => t.name)
			const tags = tagNames.join(', ')

			let tagLabel = this.$t('components.contacts.bulkActions.removeTag.singular')
			if (tagNames.length > 1) {
				tagLabel = this.$t('components.contacts.bulkActions.removeTag.plural')
			}

			return this.$t('components.contacts.bulkActions.removeTag.description', { count, tags, tagLabel })
		},
		async removeTags() {
			if (this.selectedTagIds.length === 0 || this.isLoading) return

			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.removeTag.title'),
				text: this.getConfirmText(),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return

			this.$emit('update:isLoading', true)

			this.contactsStore
				.removeTagBulkRequest(
					this.selectedContactIds,
					this.selectionType,
					this.chatAccountsStore.active?.id,
					this.selectedTagIds,
				)
				.then(() => {
					this.selectedTagIds = []
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
