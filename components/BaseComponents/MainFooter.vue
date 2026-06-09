<template>
	<footer class="bg-base-100 rounded-lg">
		<div class="container mx-auto px-6 py-12 space-y-12">
			<div class="flex flex-col sm:flex-row gap-x-15 gap-y-5">
				<!-- Logo ve İletişim Bölümü -->
				<div class="space-y-6 max-w-md">
					<!-- Logo -->
					<div>
						<LocalizedLink aria-label="Logo" name="index">
							<SimpliersLogo class="text-3xl" />
							<span class="break-line" />
							<ChatLogo class="text-[2.65rem]" />
						</LocalizedLink>
						<div class="text-sm mt-1 font-medium">From Türkiye with ❤️</div>
					</div>

					<!-- İletişim -->
					<div class="flex items-center gap-2 text-sm text-base-content/70 hover:text-simpliers transition-colors">
						<i class="fa-solid fa-envelope" />
						<a href="mailto:hello@simpliers.com" rel="noreferrer nofollow noopener">hello@simpliers.com</a>
					</div>
				</div>

				<nav class="">
					<AiAssistantLinks
						:prompt="aiPrompt"
						show-labels
						class="flex-wrap gap-2 py-3 grid grid-cols-2 sm:flex sm:flex-col items-start"
						btn-class="btn gap-2 shrink-0 truncate justify-start"
					/>
				</nav>
			</div>
			<div
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-y-20 gap-x-5 [&_a]:block [&_a]:text-sm [&_a]:text-base-content/70 [&_a]:hover:text-simpliers [&_a]:transition-colors"
			>
				<!--
				<div class="hidden lg:block lg:col-span-2"></div>
-->
				<!--				<div-->
				<!--					class="col-span-6 lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 "-->
				<!--				>-->
				<!-- Kurumsal -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.corporate') }}
					</div>
					<div class="space-y-3">
						<localized-link name="about-us">{{ $t('components.baseComponents.mainFooter.aboutUs') }}</localized-link>
						<localized-link name="contact">{{ $t('components.baseComponents.mainFooter.contactUs') }}</localized-link>
					</div>
				</nav>

				<!-- Landings -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.personas') }}
					</div>
					<div class="space-y-3">
						<localized-link name="influencer">
							{{ $t('components.baseComponents.mainFooter.influencers') }}
						</localized-link>
						<localized-link name="brand">
							{{ $t('components.baseComponents.mainFooter.brands') }}
						</localized-link>
						<localized-link name="agency">
							{{ $t('components.baseComponents.mainFooter.agencies') }}
						</localized-link>
						<localized-link name="educators">
							{{ $t('components.baseComponents.mainFooter.educators') }}
						</localized-link>
						<localized-link name="real-estate-agents">
							{{ $t('components.baseComponents.mainFooter.realEstateAgents') }}
						</localized-link>
						<localized-link name="dietitians">
							{{ $t('components.baseComponents.mainFooter.dietitians') }}
						</localized-link>
						<localized-link name="life-coaches-astrologers">
							{{ $t('components.baseComponents.mainFooter.lifeCoachesAstrologers') }}
						</localized-link>
						<localized-link name="beauty-salons">
							{{ $t('components.baseComponents.mainFooter.beautySalons') }}
						</localized-link>
						<localized-link name="travel-agencies">
							{{ $t('components.baseComponents.mainFooter.travelAgencies') }}
						</localized-link>
						<localized-link name="shoe-bag-boutiques">
							{{ $t('components.baseComponents.mainFooter.shoeBagBoutiques') }}
						</localized-link>
						<localized-link name="personal-trainers">
							{{ $t('components.baseComponents.mainFooter.personalTrainers') }}
						</localized-link>
						<localized-link name="templates">
							{{ $t('components.baseComponents.mainFooter.templates') }}
						</localized-link>
						<localized-link name="pricing">
							{{ $t('components.baseComponents.mainFooter.prices') }}
						</localized-link>
					</div>
				</nav>

				<!-- Services -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.services') }}
					</div>
					<div class="space-y-3">
						<a
							:href="
								$mergeDomainNPath(
									runtimeConfig.public.simpliersUrl,
									$t('components.baseComponents.mainFooter.links.giveaway'),
								)
							"
							class="text-nowrap"
							rel="openner referrer"
							target="_blank"
						>
							<!--								{{ $t('components.baseComponents.mainFooter.giveaway') }}-->
							<SimpliersLogo />
							<GiveawayLogo />
							<i class="fa fa-external-link-alt link-icon" />
						</a>
						<a
							:href="
								$mergeDomainNPath(runtimeConfig.public.formsUrl, $t('components.baseComponents.mainFooter.links.forms'))
							"
							class="text-nowrap"
							rel="openner referrer"
							target="_blank"
						>
							<SimpliersLogo />
							<FormsLogo />
							<i class="fa fa-external-link-alt link-icon" />
						</a>
						<a
							:href="
								$mergeDomainNPath(
									runtimeConfig.public.simpliersUrl,
									$t('components.baseComponents.mainFooter.links.blog'),
								)
							"
							class="text-nowrap"
							rel="openner referrer"
							target="_blank"
						>
							<SimpliersLogo />
							<BlogLogo />
							<i class="fa fa-external-link-alt link-icon" />
						</a>
						<a :href="runtimeConfig.public.hubUrl" rel="openner referrer" target="_blank">
							<SimpliersLogo />
							<HUBLogo />
							<i class="fa fa-external-link-alt link-icon" />
						</a>
						<!--							<a :href="$mergeDomainNPath(runtimeConfig.public.baseUrl, $t('components.baseComponents.mainFooter.links.chat'))" rel="openner referrer" target="_blank">-->
						<!--								<SimpliersLogo />-->
						<!--								<ChatLogo />-->
						<!--								<i class="fa fa-external-link-alt link-icon" />-->
						<!--							</a>-->
						<a
							:href="
								$mergeDomainNPath(
									runtimeConfig.public.simpliersUrl,
									$t('components.baseComponents.mainFooter.links.storyViewer'),
								)
							"
							class="text-nowrap"
							rel="openner referrer"
							target="_blank"
						>
							{{ $t('components.baseComponents.mainFooter.anonymStoryViewer') }}
							<i class="fa fa-external-link-alt link-icon" />
						</a>
					</div>
				</nav>

				<!-- Use Cases -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.useCases') }}
					</div>
					<div class="space-y-3">
						<LocalizedLink name="use-case">
							{{ $t('components.baseComponents.mainFooter.allUseCases') }}
						</LocalizedLink>
						<LocalizedLink name="use-case-dm-from-comments">
							{{ $t('components.baseComponents.mainFooter.dmFromComments') }}
						</LocalizedLink>
						<LocalizedLink name="use-case-hide-toxic-comments">
							{{ $t('components.baseComponents.mainFooter.hideToxicComments') }}
						</LocalizedLink>
						<LocalizedLink name="use-case-reply-positive-comments">
							{{ $t('components.baseComponents.mainFooter.replyPositiveComments') }}
						</LocalizedLink>
						<LocalizedLink name="use-case-reply-giveaway-entries">
							{{ $t('components.baseComponents.mainFooter.replyGiveawayEntries') }}
						</LocalizedLink>
						<LocalizedLink name="use-case-lead-collection">
							{{ $t('components.baseComponents.mainFooter.leadCollection') }}
						</LocalizedLink>

						<!--							<localized-link name="auth-register">-->
						<!--								{{ $t('components.baseComponents.mainFooter.signUp') }}-->
						<!--							</localized-link>-->
					</div>
				</nav>

				<!-- Alternatives -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.alternatives') }}
					</div>
					<div class="space-y-3">
						<LocalizedLink name="alternatives-manychat">
							{{ $t('components.baseComponents.mainFooter.manychatAlternative') }}
						</LocalizedLink>
						<LocalizedLink name="alternatives-creatorflow">
							{{ $t('components.baseComponents.mainFooter.creatorflowAlternative') }}
						</LocalizedLink>
						<LocalizedLink name="alternatives-linkdm">
							{{ $t('components.baseComponents.mainFooter.linkdmAlternative') }}
						</LocalizedLink>
						<!--						<LocalizedLink name="alternatives-superprofile">-->
						<!--							{{ $t('components.baseComponents.mainFooter.superprofileAlternative') }}-->
						<!--						</LocalizedLink>-->
					</div>
				</nav>

				<!-- Tools -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.tools') }}
					</div>
					<div class="space-y-3">
						<LocalizedLink name="tools-utm-link">
							{{ $t('components.baseComponents.mainFooter.utmLinkGenerator') }}
						</LocalizedLink>
						<LocalizedLink name="tools-dm-roi-calculator">
							{{ $t('components.baseComponents.mainFooter.dmRoiCalculator') }}
						</LocalizedLink>
						<LocalizedLink name="tools-instagram-image-splitter">
							{{ $t('components.baseComponents.mainFooter.imageSplitter') }}
						</LocalizedLink>
					</div>
				</nav>

				<!-- Kaynaklar -->
				<nav class="space-y-4">
					<div class="text-sm uppercase tracking-wider">
						{{ $t('components.baseComponents.mainFooter.resources') }}
					</div>
					<div class="space-y-3">
						<!--						<a-->
						<!--							:href="-->
						<!--								$mergeDomainNPath(-->
						<!--									runtimeConfig.public.simpliersUrl,-->
						<!--									$t('components.baseComponents.mainFooter.links.blog'),-->
						<!--								)-->
						<!--							"-->
						<!--							target="_blank"-->
						<!--							rel="openner referrer"-->
						<!--						>-->
						<!--							<BlogLogo />-->
						<!--						</a>-->
						<LocalizedLink name="blog">
							<BlogLogo />
						</LocalizedLink>
						<localized-link name="support">
							{{ $t('components.baseComponents.mainFooter.support') }}
						</localized-link>
						<LocalizedLink name="guides">
							{{ $t('components.baseComponents.mainFooter.allGuides') }}
						</LocalizedLink>

						<!--							<localized-link name="auth-register">-->
						<!--								{{ $t('components.baseComponents.mainFooter.signUp') }}-->
						<!--							</localized-link>-->
					</div>
				</nav>
				<!--				</div>-->
			</div>

			<div class="divider" />
			<div class="pt-8 space-y-5">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-2">
						<client-only>
							<copy-to-clipboard :copy-text="sessionId.toString()" @copied="ticketClicked">
								<div class="text-truncate max-w-80 me-1">Ticket: {{ sessionId }}</div>
							</copy-to-clipboard>
						</client-only>
					</div>
					<locale-switcher />
				</div>

				<div class="flex items-center justify-between gap-6">
					<div class="flex flex-wrap gap-6 text-base-content text-sm">
						<localized-link name="privacy-policy">{{
							$t('components.baseComponents.mainFooter.privacyPolicy')
						}}</localized-link>
						<localized-link name="legal-information">{{
							$t('components.baseComponents.mainFooter.legalInformation')
						}}</localized-link>
						<localized-link name="subscription-agreement">{{
							$t('components.baseComponents.mainFooter.paymentTerms')
						}}</localized-link>
					</div>
					<!--					<div class="flex gap-1 text-base-content/50">-->
					<!--						<a href="#" class="btn btn-xs">-->
					<!--							<i class="fa-brands fa-instagram text-sm"></i>-->
					<!--						</a>-->
					<!--						<a href="#" class="btn btn-xs">-->
					<!--							<i class="fa-brands fa-x-twitter text-sm"></i>-->
					<!--						</a>-->
					<!--						<a href="#" class="btn btn-xs">-->
					<!--							<i class="fa-brands fa-facebook text-sm"></i>-->
					<!--						</a>-->
					<!--						<a href="#" class="btn btn-xs">-->
					<!--							<i class="fa-brands fa-linkedin text-sm"></i>-->
					<!--						</a>-->
					<!--						<a href="#" class="btn btn-xs">-->
					<!--							<i class="fa-brands fa-youtube text-sm"></i>-->
					<!--						</a>-->
					<!--					</div>-->
				</div>
			</div>

			<div class="space-y-5 text-base-content/50 text-sm mt-10">
				<i18n-t keypath="components.baseComponents.mainFooter.copyright">
					<template #brand>
						<SimpliersLogo />
					</template>
					<template #year>
						{{ new Date().getFullYear() }}
					</template>
				</i18n-t>
				<div>
					{{ $t('components.baseComponents.mainFooter.cookieNotice') }}
				</div>
			</div>
		</div>
	</footer>
</template>
<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import apiList from '~/apis/ApiList.js'
import LocaleSwitcher from '~/components/BaseComponents/LocaleSwitcher.vue'
import BlogLogo from '~/components/GlobalComponents/Brands/BlogLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import FormsLogo from '~/components/GlobalComponents/Brands/FormsLogo.vue'
import GiveawayLogo from '~/components/GlobalComponents/Brands/GiveawayLogo.vue'
import HUBLogo from '~/components/GlobalComponents/Brands/HUBLogo.vue'
import AiAssistantLinks from '~/components/Support/AiAssistantLinks.vue'

export default {
	name: 'MainFooter',
	components: {
		AiAssistantLinks,
		HUBLogo,
		GiveawayLogo,
		FormsLogo,
		ChatLogo,
		BlogLogo,
		LocaleSwitcher,
		CopyToClipboard,
		LocalizedLink,
		SimpliersLogo,
	},
	setup() {
		return {
			auth: useAuthStore(),
			sessionStore: useSessionStore(),
			settingsStore: useSettingsStore(),
			runtimeConfig: useRuntimeConfig(),
		}
	},
	computed: {
		aiPrompt() {
			const chatUrl = this.$mergeDomainNPath(
				this.runtimeConfig.public.baseUrl,
				this.$t('components.baseComponents.mainFooter.chatPath'),
			)
			return encodeURIComponent(
				this.$t('components.baseComponents.mainFooter.aiPrompt', {
					chatUrl: chatUrl,
				}),
			)
		},
		sessionId() {
			return this.sessionStore.data.id ?? 'N/A'
		},
		hideFooter() {
			return this.settingsStore.hideFooter
		},
		// routeIsBlogContent() {
		//   consoleLog('routeIsBlogContent', this.$route.name);
		//   return this.$route.name.startsWith('blog-slug');
		// },
	},
	methods: {
		async ticketClicked() {
			await this.$requestAdapter.get(apiList.limits)
			//await navigator.clipboard?.writeText(this.sessionId)
		},
	},
}
</script>
