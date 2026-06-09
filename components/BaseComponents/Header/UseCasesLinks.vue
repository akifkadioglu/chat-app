<template>
	<ul class="flex-1 space-y-1 md:py-1">
		<li>
			<MenuLink
				name="use-case-dm-from-comments"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div class="bg-primary/10 rounded-lg p-2 shrink-0">
					<div
						class="w-5 h-5 bg-primary"
						style="
							mask-image: url('/images/theme/vendor/duotone-icons/com/com012.svg');
							mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-image: url('/images/theme/vendor/duotone-icons/com/com012.svg');
							-webkit-mask-size: contain;
							-webkit-mask-repeat: no-repeat;
						"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.dmFromComments.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.dmFromComments.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="use-case-lead-collection"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div class="bg-info/10 rounded-lg p-2 shrink-0">
					<div
						class="w-5 h-5 bg-info"
						style="
							mask-image: url('/images/theme/vendor/duotone-icons/com/com010.svg');
							mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-image: url('/images/theme/vendor/duotone-icons/com/com010.svg');
							-webkit-mask-size: contain;
							-webkit-mask-repeat: no-repeat;
						"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.leadCollection.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.leadCollection.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="use-case-hide-toxic-comments"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-300 transition-colors"
			>
				<div class="bg-error/10 rounded-lg p-2 shrink-0">
					<div
						class="w-5 h-5 bg-error"
						style="
							mask-image: url('/images/theme/vendor/duotone-icons/gen/gen025.svg');
							mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-image: url('/images/theme/vendor/duotone-icons/gen/gen025.svg');
							-webkit-mask-size: contain;
							-webkit-mask-repeat: no-repeat;
						"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.hideToxicComments.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.hideToxicComments.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="use-case-reply-positive-comments"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div class="bg-success/10 rounded-lg p-2 shrink-0">
					<div
						class="w-5 h-5 bg-success"
						style="
							mask-image: url('/images/theme/vendor/duotone-icons/com/com003.svg');
							mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-image: url('/images/theme/vendor/duotone-icons/com/com003.svg');
							-webkit-mask-size: contain;
							-webkit-mask-repeat: no-repeat;
						"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.replyPositiveComments.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.replyPositiveComments.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="use-case-reply-giveaway-entries"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div class="bg-warning/10 rounded-lg p-2 shrink-0">
					<div
						class="w-5 h-5 bg-warning"
						style="
							mask-image: url('/images/theme/vendor/duotone-icons/gra/gra006.svg');
							mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-image: url('/images/theme/vendor/duotone-icons/gra/gra006.svg');
							-webkit-mask-size: contain;
							-webkit-mask-repeat: no-repeat;
						"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.replyGiveawayEntries.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.replyGiveawayEntries.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
		<li>
			<MenuLink
				name="templates"
				:target="linkTarget"
				class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div class="bg-secondary/10 rounded-lg p-2 shrink-0">
					<i class="fa-regular fa-compass text-secondary" />
				</div>
				<div class="min-w-0 flex-1">
					<span class="font-semibold block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.templates.title')
					}}</span>
					<span class="text-xs text-muted leading-tight block">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.templates.description')
					}}</span>
				</div>
				<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
			</MenuLink>
		</li>
	</ul>
</template>

<script>
import MenuLink from '~/components/BaseComponents/Header/MenuLink.vue'

export default {
	components: { MenuLink },
	props: {
		openInNewTab: { type: Boolean, default: false },
	},
	computed: {
		linkTarget() {
			return this.openInNewTab ? '_blank' : ''
		},
	},
}
</script>
