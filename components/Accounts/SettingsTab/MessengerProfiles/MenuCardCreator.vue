<template>
	<div class="flex items-center justify-between bg-base-100 rounded-lg">
		<div>
			<slot>
				<div class="flex gap-2 items-baseline">
					<slot name="icon" />
					<span>{{ title }}</span>
				</div>
			</slot>
			<p class="text-sm text-muted text-wrap">
				<slot name="description">
					{{ description }}
				</slot>
			</p>
		</div>

		<!--			<div class="mt-auto">-->
		<!--				<div class="space-y-2" v-if="hasMenu">-->
		<!--					<div class="flex items-center gap-2 text-sm">-->
		<!--						<i class="fa fa-list fa-lg" />-->
		<!--						<span class="font-medium">-->
		<!--							{{ menuItemsLengthText }}-->
		<!--						</span>-->
		<!--					</div>-->
		<!--					<div class="flex items-center gap-2 text-sm">-->
		<!--						<i class="fa fa-language fa-lg"></i>-->
		<!--						<span class="font-medium">-->
		<!--							{{ menuLocalizationsLengthText }}-->
		<!--						</span>-->
		<!--					</div>-->
		<!--				</div>-->
		<!--				<div v-else>-->
		<!--					<div class="text-info rounded-none text-sm">-->
		<!--						{{ noMenuText }}-->
		<!--					</div>-->
		<!--				</div>-->
		<!--			</div>-->

		<div class="flex space-x-1">
			<button class="flex-1 btn btn-primary btn-sm btn-soft btn-block btn-transition" @click="$emit('setupMenu')">
				<i :class="{ 'fa-solid fa-wand-magic-sparkles': !hasMenu, 'fa-solid fa-edit': hasMenu }" />
				{{
					hasMenu
						? $t('components.accounts.overviewTab.persistentMenu.actions.edit')
						: $t('components.accounts.overviewTab.persistentMenu.actions.setup')
				}}
			</button>
			<button
				:disabled="isLoading"
				v-if="hasMenu"
				@click="$emit('askRemoveMenu')"
				class="btn btn-sm btn-error btn-soft"
			>
				<loading-element :is-loading="isLoading">
					<i class="fa fa-trash" />
				</loading-element>
			</button>
		</div>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		isLoading: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		hasMenu: {
			type: Boolean,
		},
	},
}
</script>

<style scoped></style>
