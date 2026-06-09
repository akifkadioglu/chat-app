<template>
	<div class="flex h-full w-full relative">
		<button
			@click="close"
			class="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-colors"
			aria-label="Close"
		>
			<i class="fa fa-times text-xl text-muted"></i>
		</button>
		<div class="flex h-full w-full overflow-y-auto">
			<div class="bs container flex justify-center my-auto py-10">
				<div class="space-y-12 text-center max-w-md">
					<!-- Animated Success Icon -->
					<div class="flex justify-center">
						<Lottie
							:loop="false"
							:autoplay="true"
							:width="250"
							:height="250"
							animationLink="/images/lottie/connected.json"
						/>
					</div>

					<!-- Success Title -->
					<div class="space-y-2">
						<i18n-t
							keypath="components.app.accountConnectedView.success.title"
							class="text-2xl font-bold text-base-content"
							tag="div"
						>
							<template #username>
								<b>{{ account.postAccount.username }}</b>
							</template>
						</i18n-t>
						<p class="text-muted text-base">
							{{ $t('components.app.accountConnectedView.success.description') }}
						</p>
					</div>

					<!-- Account Profile Card -->
					<div class="card border border-primary/30 p-6">
						<div class="flex items-center gap-4">
							<div class="relative">
								<ProfilePicture :src="account?.postAccount?.profilePicture" :size="80" />
							</div>
							<div class="space-y-1 text-start">
								<div class="flex items-center justify-center gap-1.5">
									<span class="font-bold text-xl text-base-content">{{ account?.postAccount?.name }}</span>
									<IsVerifiedImg v-if="account.postAccount.isVerified" />
								</div>
								<p class="text-muted">@{{ account?.postAccount?.username }}</p>
								<p v-if="account?.postAccount?.followersCountString" class="text-subtle text-sm">
									{{ account?.postAccount?.followersCountString }} {{ $t('common.followers') }}
								</p>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="space-y-3">
						<localized-link name="account" class="btn btn-primary w-full justify-center" @click="$emit('close')">
							{{ $t('components.app.accountConnectedView.getStartedButton') }}
							<i class="fa fa-chevron-right link-icon" />
						</localized-link>
					</div>

					<!-- Follow Section -->
					<div class="border border-subtle border-t-0 rounded-lg">
						<div class="p-1 bg-gradient-to-r from-instagram to-instagram/50 rounded-t-lg" />
						<div class="bg-base-100 rounded-lg">
							<div class="space-y-4 py-6 px-4">
								<h3 class="font-semibold text-base-content">
									<i18n-t keypath="components.app.accountConnectedView.follow.title">
										<template #username>
											<span class="text-simpliers">{{ $instagramUsername() }}</span>
										</template>
									</i18n-t>
								</h3>
								<p class="text-sm text-muted text-start">
									{{ $t('components.app.accountConnectedView.follow.description') }}
								</p>
								<div class="text-center">
									<a
										:href="`https://www.instagram.com/${$instagramUsername()}`"
										target="_blank"
										rel="noopener noreferrer nofollow"
										class="btn btn-sm btn-outline btn-info"
									>
										{{ $t('components.app.accountConnectedView.follow.button') }}
										<i class="fa fa-external-link link-icon" aria-hidden="true" />
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import CreateFlowButton from '~/components/Flow/CreateFlowButton.vue'
import FollowSimpliersComponent from '~/components/GlobalComponents/FollowSimpliersComponent.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import Lottie from '~/components/GlobalComponents/Elements/Lottie.vue'
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'

export default {
	components: {
		IsVerifiedImg,
		AccountProfile,
		Lottie,
		LocalizedLink,
		SimpliersLogo,
		FollowSimpliersComponent,
		CreateFlowButton,
		ProfilePicture,
	},
	emits: ['close'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		account() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		close() {
			this.$emit('close')
		},
	},
}
</script>

<style scoped>
/* Custom gradient for the divider */
.bg-gradient-to-r {
	background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #f97316 100%);
}
</style>
