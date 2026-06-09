<template>
	<div class="flex-1 flex flex-col md:flex-row md:gap-5">
		<div class="md:flex-1 flex flex-col gap-3">
			<div class="hidden md:flex items-center gap-3 rounded-lg bg-linear-to-br from-secondary/10 to-secondary/5 p-4">
				<i class="fa fa-users text-3xl text-secondary shrink-0" />
				<div class="min-w-0">
					<p class="text-sm font-semibold leading-tight">
						{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.heroTitle') }}
					</p>
					<p class="text-xs text-muted mt-0.5 leading-tight">
						{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.heroDescription') }}
					</p>
				</div>
			</div>
			<ul class="space-y-1 md:py-1">
				<li>
					<MenuLink
						name="influencer"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/influencer-3.png"
							:alt="$t('components.landing.main.personas.influencer.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.influencer.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.influencer.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="brand"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/brand-3.png"
							:alt="$t('components.landing.main.personas.brand.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.brand.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.brand.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="agency"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/agency-3.png"
							:alt="$t('components.landing.main.personas.agency.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.agency.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.agency.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
			</ul>
		</div>
		<div class="md:flex-2 md:border-l md:border-base-content/10 md:pl-5">
			<div
				class="px-2 pb-1 text-[10px] uppercase font-bold text-subtle border-t border-base-content/10 pt-3 mt-2 md:border-t-0 md:pt-0 md:mt-0"
			>
				{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.industriesLabel') }}
			</div>
			<ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 md:py-1">
				<li>
					<MenuLink
						name="educators"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/educator.png"
							:alt="$t('components.landing.main.personas.educator.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.educators.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.educators.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="real-estate-agents"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/real-estator.png"
							:alt="$t('components.landing.main.personas.realEstator.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.realEstateAgents.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.realEstateAgents.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="dietitians"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/dietitian.png"
							:alt="$t('components.landing.main.personas.dietitian.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.dietitians.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.dietitians.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="life-coaches-astrologers"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/life-coach.png"
							:alt="$t('components.landing.main.personas.lifeCoachAstrologer.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.lifeCoachesAstrologers.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t(
									'components.baseComponents.defaultLayoutHeader.megaMenu.solutions.lifeCoachesAstrologers.description',
								)
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="beauty-salons"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/beauty-salons.png"
							:alt="$t('components.landing.main.personas.beauty.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.beautySalons.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.beautySalons.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="shoe-bag-boutiques"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/shoe-bag-boutiques.png"
							:alt="$t('components.landing.main.personas.shoeBag.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.shoeBagBoutiques.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.shoeBagBoutiques.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="personal-trainers"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<img
							src="/images/landing/personal-trainer.png"
							:alt="$t('components.landing.main.personas.personalTrainer.alt')"
							class="size-10 shrink-0 object-contain"
							loading="lazy"
						/>
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.personalTrainers.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.personalTrainers.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
				<li>
					<MenuLink
						name="travel-agencies"
						:target="linkTarget"
						class="items-start! text-wrap! gap-3! px-2! py-3! rounded-lg hover:bg-base-200 transition-colors"
					>
						<!--					<img-->
						<!--						src="/images/landing/travel-agencies.png"-->
						<!--						:alt="$t('components.landing.main.personas.travel.alt')"-->
						<!--						class="size-10 shrink-0 object-contain"-->
						<!--						loading="lazy"-->
						<!--					/>-->
						<div class="min-w-0 flex-1">
							<span class="font-semibold block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.travelAgencies.title')
							}}</span>
							<span class="text-xs text-muted leading-tight block">{{
								$t('components.baseComponents.defaultLayoutHeader.megaMenu.solutions.travelAgencies.description')
							}}</span>
						</div>
						<i v-if="openInNewTab" class="fa fa-external-link-alt link-icon text-xs text-muted shrink-0 self-center" />
					</MenuLink>
				</li>
			</ul>
		</div>
	</div>
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
