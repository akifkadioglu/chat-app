<template>
	<div>
		<div ref="errorAlert" v-auto-animate>
			<div v-if="errorMessage" class="py-4 px-4">
				<div class="alert alert-soft alert-error items-start">
					<div>
						<div class="text-lg">
							<i class="fa fa-exclamation-circle mt-1" />
							{{ errorMessage }}
						</div>
						<p class="pt-1 mt-2 border-top mb-0 text-reset">
							{{ $t('components.pay.payElements.paymentFailed.title') }}
							{{ $t('components.pay.payElements.paymentFailed.text') }}
						</p>
					</div>
				</div>
			</div>
		</div>

		<div v-if="cards.length !== 0">
			<!-- collapse class'ının içinde p-4 var Collapse component'ine p-4 verdiğim için buna p-4 verdim -->
			<StoredCards
				class="px-8 py-6"
				:showPayButton="true"
				:cards="cards"
				@payWithStoredCard="subscribe"
				:subscriptionPlanPriceId="subscriptionPlan?.price?.id"
				:isLoading="isLoading"
			/>
			<hr class="border border-subtle" />
		</div>
		<Collapse class="px-4 py-2" v-auto-animate :open="cards.length === 0" :collapsible="cards.length !== 0">
			<template #title v-if="cards.length !== 0">
				<span class="text-lg">
					{{ $t('components.pay.paymentElements.useNewCard') }}
					<i class="fa fa-credit-card" />
				</span>
			</template>
			<div :class="{ 'pb-15': cards.length === 0 }">
				<PaymentForm
					:execPrice="execPrice"
					:subscriptionPlan="subscriptionPlan"
					@paymentSubmitted="subscribe"
					:isLoading="isLoading"
				/>
			</div>
		</Collapse>

		<ThreeDSecureModal
			ref="threeDSecureModal"
			@paymentSuccess="$emit('paymentSuccess', $event)"
			@errorMessage="paymentFailed"
		/>
	</div>
</template>
<script>
import PaymentForm from '~/components/Pay/PaymentForm.vue'
import apiList from '~/apis/ApiList.js'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import LazyLoadImage from '~/components/GlobalComponents/LazyLoadImage.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import StoredCards from '~/components/Pay/StoredCards.vue'
import ThreeDSecureModal from '~/components/Pay/ThreeDSecureModal.vue'
import { Plan } from '~/models/Pricing/Plan.ts'

export default {
	components: { ThreeDSecureModal, StoredCards, LoadingElement, LazyLoadImage, Collapse, PaymentForm },
	props: {
		subscriptionPlan: {
			type: Plan,
			required: true,
		},
		showPayButtons: {
			type: Boolean,
			default: true,
		},
		removeButtonsAreShowing: {
			type: Boolean,
			default: true,
		},
		loadingStoreCardId: {
			type: Number,
			default: null,
		},
		showEmptyState: {
			type: Boolean,
			default: true,
		},
		productParameter: {
			type: Object,
			default: () => ({}),
		},
		execPrice: {
			type: Number,
			default: 0,
		},
	},
	inject: ['getContentContainer'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	data() {
		return {
			cards: [],
			isLoading: false,
			errorMessage: '',
		}
	},
	mounted() {
		this.$requestAdapter
			.get(apiList.prices.card.get, {
				query: {
					onlyCreditCards: true,
				},
			})
			.then((res) => {
				this.cards = res.data.cards
			})
	},
	emits: ['paymentSuccess'],
	methods: {
		subscribe(values) {
			this.isLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscribe,
					{ ...values, ...this.productParameter },
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((res) => {
					if (res.status) {
						if (res.code === 3) {
							return this.$refs.threeDSecureModal.showModal(res.data.content)
						}
					}
					return this.$emit('paymentSuccess', res.data)
				})
				.catch((err) => {
					consoleLog(err, err.response)
					this.paymentFailed(err.response.data.message)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		paymentFailed(message) {
			this.errorMessage = message
			const el = this.getContentContainer?.()
			const errorAlert = this.$refs.errorAlert
			const distanceTop = errorAlert.getBoundingClientRect().top
			if (el) {
				el.scrollTo({ top: Math.abs(distanceTop), behavior: 'smooth' })
			}
		},
	},
}
</script>

<style scoped></style>
