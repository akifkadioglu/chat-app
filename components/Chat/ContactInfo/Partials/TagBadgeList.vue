<template>
	<div class="w-full">
		<input
			v-if="showSearch"
			v-model="searchQuery"
			type="text"
			class="input input-sm input-bordered w-full mb-2"
			placeholder="Tag ara..."
			@click.stop
		/>
		<div class="max-h-40 flex flex-wrap gap-2 overflow-y-auto">
			<div v-for="tag in filteredTags" :key="tag.id" class="cursor-pointer" @click="toggleTag(tag)">
				<div
					class="badge badge-sm gap-1"
					:style="{ backgroundColor: isSelected(tag.id) ? tag.color + '90' : tag.color + '20' }"
				>
					{{ tag.name }}
					<i v-if="isSelected(tag.id)" class="fa fa-check text-xs" />
				</div>
			</div>
			<div v-if="filteredTags.length === 0" class="text-sm text-muted py-2">
				{{ $t('components.chat.contactInfo.partials.tagBadgeList.noTagsFound') }}
			</div>
		</div>
		<slot />
		<!--		<div v-if="selectedTagIds.length > 0" class="mt-3 pt-2 border-t border-base-300">-->
		<!--			<span class="text-xs text-muted">{{ selectedTagIds.length }} tag seçildi</span>-->
		<!--		</div>-->
	</div>
</template>
<script>
export default {
	props: {
		tags: {
			type: Array,
			default: () => [],
		},
		selectedTagIds: {
			type: Array,
			default: () => [],
		},
		showSearch: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['toggleTag'],
	data() {
		return {
			searchQuery: '',
		}
	},
	computed: {
		filteredTags() {
			if (!this.searchQuery.trim()) return this.tags
			const query = this.searchQuery.toLowerCase().trim()
			return this.tags.filter((tag) => tag.name.toLowerCase().includes(query))
		},
	},
	methods: {
		isSelected(tagId) {
			return this.selectedTagIds.includes(tagId)
		},
		toggleTag(tag) {
			this.$emit('toggleTag', tag)
		},
	},
}
</script>
