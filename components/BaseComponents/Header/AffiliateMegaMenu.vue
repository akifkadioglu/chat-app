<template>
	<MegaMenu content-width="md:w-[min(90vw,580px)]" align="center" class="text-simpliers">
		<template #title>
			<span class="font-medium">
				<i class="fa fa-hashtag fa-md" />
				{{ $t('components.baseComponents.defaultLayoutHeader.navigation.partners') }}
			</span>
		</template>
		<div class="md:flex md:gap-4">
			<!-- Left: Influencer visual -->
			<div
				class="hidden md:flex flex-col justify-end rounded-lg bg-linear-to-br from-error/15 to-primary/10 w-44 shrink-0 overflow-hidden relative"
			>
				<NuxtImg
					src="/images/landing/partners-hero.png"
					:alt="$t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.heroAlt')"
					:width="352"
					sizes="176px"
					format="webp"
					loading="lazy"
					class="absolute inset-0 w-full h-full object-cover object-top"
				/>
				<div class="relative bg-linear-to-t from-base-100/95 to-base-100/0 p-3 pt-10">
					<p class="text-xs font-semibold leading-tight">
						{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.heroTitle') }}
					</p>
				</div>
			</div>

			<!-- Right: Content -->
			<MenuLink
				name="affiliate"
				class="flex-1 flex flex-col items-start! text-wrap! gap-6! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
			>
				<div>
					<i18n-t keypath="components.baseComponents.defaultLayoutHeader.megaMenu.partners.cta.headline" tag="div">
						<template #partnership>
							<span class="text-simpliers leading-tight text-lg">
								{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.cta.partnership') }}
							</span>
						</template>
					</i18n-t>
					<div class="text-xs text-muted leading-tight block">
						{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.cta.description') }}
					</div>
				</div>

				<!-- Commission -->
				<div class="flex items-baseline gap-2 px-1">
					<i18n-t
						keypath="components.baseComponents.defaultLayoutHeader.megaMenu.partners.cta.commission"
						tag="div"
						class="text-sm text-subtle leading-tight"
					>
						<template #percentage>
							<span class="text-3xl font-semibold text-primary leading-none align-baseline">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.percentage', { rate: 25 })
							}}</span>
						</template>
					</i18n-t>
				</div>

				<!-- CTA link -->
				<div class="min-w-0">
					<span class="font-semibold">{{
						$t('components.baseComponents.defaultLayoutHeader.megaMenu.partners.cta.title')
					}}</span>
					<i class="fa fa-chevron-right link-icon" />
				</div>
			</MenuLink>
		</div>
	</MegaMenu>
</template>

<script>
import MegaMenu from '~/components/BaseComponents/Header/MegaMenu.vue'
import MenuLink from '~/components/BaseComponents/Header/MenuLink.vue'

export default {
	components: {
		MegaMenu,
		MenuLink,
	},
}
</script>
