<template>
	<div class="flex-1">
		<!-- Tags Header -->
		<div class="sticky top-0 bg-base-100 z-2 p-2 gap-1 flex flex-wrap items-center mb-4 px-2">
			<h3 class="text-xl flex items-center gap-2">
				<i class="fa fa-tags text-primary"></i>
				{{ $t('components.accounts.attributesTab.chatAccountTags.title') }}
				<span class="badge badge-primary badge-soft badge-sm">{{ tags.length }}</span>
			</h3>
			<div class="flex items-center gap-3 ms-auto">
				<CustomDropdown placement="bottom-end" @show="focusNewTagInput">
					<button class="btn btn-sm btn-info btn-transition">
						<i class="fa fa-plus" />
					</button>
					<template #popper="{ hide }">
						<div class="p-5">
							<TagCreator
								ref="tagCreator"
								:chat-account-id="account.id"
								:new-tag="newTag"
								@tagCreated="tagCreated(hide)"
							/>
						</div>
					</template>
				</CustomDropdown>
				<button :disabled="tagLoading" class="btn btn-sm btn-primary" @click="updateTags">
					<LoadingElement size="15" :is-loading="tagLoading">
						<i class="fa fa-check" />
					</LoadingElement>
					{{ $t('components.accounts.attributesTab.chatAccountTags.save') }}
				</button>
			</div>
		</div>

		<!-- Tags Scroll Area -->
		<div class="pr-2 space-y-2 mb-4 lg:mb-0">
			<State :is-empty="tags.length === 0" empty-img-url="">
				<label class="pb-5">
					<input ref="allCheckbox" class="checkbox checkbox-xs" type="checkbox" @change="toggleSelectAll" />
					<small>{{ $t('components.accounts.attributesTab.chatAccountTags.selectAll') }}</small>
				</label>

				<ul class="list" v-auto-animate>
					<li v-for="tag in tags" :key="tag.id" class="w-full rounded-none py-1">
						<div class="flex items-center gap-3">
							<input v-model="selectedTags" :value="tag.id" class="checkbox checkbox-xs" type="checkbox" />
							<div class="flex items-center gap-2">
								<CustomDropdown placement="right">
									<div
										class="size-7 rounded-full shrink-0 border border-subtle"
										:style="{ backgroundColor: tag.color }"
									/>
									<template #popper>
										<div class="p-2">
											<TagCreatorColorPicker :new-tag="tag" />
										</div>
									</template>
								</CustomDropdown>
								<input v-model="tag.name" class="input input-sm" />
							</div>
						</div>
					</li>
				</ul>
				<template #emptyIcon>
					<i class="fa fa-tags text-4xl text-subtle" />
				</template>
				<template #emptyTitle>
					<span class="text-subtle">
						{{ $t('components.accounts.attributesTab.chatAccountTags.emptyState.title') }}
					</span>
				</template>
			</State>

			<div v-if="selectedTags.length !== 0" class="sticky bottom-0 py-5 left-0 bg-base-100">
				<button :disabled="tagRemoving" class="btn btn-sm btn-error btn-soft" @click="askToRemoveTags">
					<LoadingElement :is-loading="tagRemoving">
						<i class="fa fa-trash" />
						<span v-if="selectedTags.length > 0" class="ml-1">({{ selectedTags.length }})</span>
					</LoadingElement>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import { DEFAULT_TAG_COLOR, useChatAccountAttributesStore } from '~/stores/chatAccountAttributes.ts'
import { ChatAccount } from '~/models/ChatAccount.ts'
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'
import TagCreator from '~/components/Chat/ContactInfo/Partials/TagCreator.vue'
import TagCreatorColorPicker from '~/components/Chat/ContactInfo/Partials/TagCreatorColorPicker.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	name: 'ChatAccountTags',
	components: {
		CustomDropdown,
		TagCreatorColorPicker,
		TagCreator,
		Tag,
		LoadingElement,
		State,
	},
	props: {
		account: {
			type: ChatAccount,
			required: true,
		},
	},
	setup() {
		return {
			chatAccountAttributes: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			tagLoading: false,
			selectedTags: [],
			tagRemoving: false,
			newTag: {
				name: '',
				color: DEFAULT_TAG_COLOR,
			},
		}
	},
	computed: {
		tags() {
			return this.account.tags
		},
	},
	mounted() {
		this.chatAccountAttributes.fetchTags(this.account.id)
	},
	watch: {
		selectedTags() {
			if (!this.$refs.allCheckbox) return

			if (this.selectedTags.length === 0) {
				this.$refs.allCheckbox.checked = false
				this.$refs.allCheckbox.indeterminate = false
				return
			}

			if (this.selectedTags.length < this.tags.length) {
				this.$refs.allCheckbox.indeterminate = true
				return
			}
			if (this.selectedTags.length === this.tags.length) {
				this.$refs.allCheckbox.checked = true
				this.$refs.allCheckbox.indeterminate = false
			}
		},
	},
	methods: {
		// prepareTags() {
		// 	this.tags = JSON.parse(JSON.stringify(this.account.tags))
		// },
		async focusNewTagInput() {
			this.$refs.tagCreator?.$refs?.newTagInput.focus()
		},
		askToRemoveTags() {
			this.$swal
				.fire({
					title: this.$t('components.accounts.attributesTab.chatAccountTags.deleteConfirmation.title'),
					text: this.$t('components.accounts.attributesTab.chatAccountTags.deleteConfirmation.text', {
						count: this.selectedTags.length,
					}),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.accounts.attributesTab.chatAccountTags.deleteConfirmation.confirm'),
					cancelButtonText: this.$t('components.accounts.attributesTab.chatAccountTags.deleteConfirmation.cancel'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.removeSelectedTags()
					}
				})
		},
		toggleSelectAll($event) {
			if ($event.target.checked) {
				this.selectedTags = this.tags.map((tag) => tag.id)
			} else {
				this.selectedTags = []
			}
		},
		tagCreated(hideFunc) {
			hideFunc()
			this.newTag = {
				name: '',
				color: DEFAULT_TAG_COLOR,
			}
			// this.prepareTags()
		},
		updateTags() {
			this.tagLoading = true
			this.chatAccountAttributes.updateTagsRequest(this.account.id, this.tags).finally(() => {
				this.tagLoading = false
			})
		},
		removeSelectedTags() {
			if (this.selectedTags.length === 0) return
			this.tagRemoving = true
			this.chatAccountAttributes.removeTags(this.account.id, this.selectedTags).finally(() => {
				this.tagRemoving = false
				this.selectedTags = []
				consoleLog('this.account.tags', this.account.tags)
				// this.prepareTags()
			})
		},
	},
}
</script>
