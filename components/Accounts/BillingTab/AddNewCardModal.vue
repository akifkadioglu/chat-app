<template>
	<div>
		<Modal ref="modal" :showCloseButton="false">
			<div class="mt-5">
				<div v-if="errorMessage" class="alert alert-error alert-soft">
					<i class="fa fa-exclamation-circle text-base font-bold mr-1" />
					{{ errorMessage }}
					<p class="pt-1 mt-2 border-t border-base-300 mb-0">
						{{ $t('components.accounts.billingTab.addNewCardModal.paymentFailed.title') }}
						<br />
						{{ $t('components.accounts.billingTab.addNewCardModal.paymentFailed.text') }}
					</p>
				</div>

				<PaymentForm
					:isLoading="loading"
					:subscriptionPlan="plan"
					payButtonTextPath="components.accounts.billingTab.addNewCardModal.saveCardButton"
					@paymentSubmitted="saveCardRequest"
				/>
			</div>
		</Modal>

		<ThreeDSecureModal ref="threeDSecureModal" @paymentSuccess="paymentSuccess" @errorMessage="errorMessage = $event" />
	</div>
</template>

<script>
import apiList from '@/apis/ApiList'
import Modal from '~/components/GlobalComponents/Modal.vue'
import ThreeDSecureModal from '~/components/Pay/ThreeDSecureModal.vue'
import PaymentForm from '~/components/Pay/PaymentForm.vue'
import { Plan } from '~/models/Pricing/Plan.ts'

export default {
	components: {
		PaymentForm,
		ThreeDSecureModal,
		Modal,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			loading: false,
			errorMessage: null,
		}
	},
	computed: {
		plan() {
			return this.chatAccount.subscription.plan
		},
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		show() {
			this.$refs.modal?.showModal()
		},
		hide() {
			this.$refs.modal?.hideModal()
		},
		saveCardRequest(data) {
			this.loading = true
			this.$refs.threeDSecureModal.hideModal()
			this.errorMessage = null

			this.$requestAdapter
				.post(apiList.prices.card.add, data)
				.then((response) => {
					if (response.code === 3) {
						return this.$refs.threeDSecureModal.showModal(response.data.content)
					}
					this.paymentSuccess(response)
				})
				.catch((error) => {
					this.errorMessage = error.response.data.message
				})
				.finally(() => {
					this.loading = false
				})
		},
		paymentSuccess(response) {
			const card = response?.data?.card ?? response?.stored_card
			this.$emit('cardAdded', card)
			this.hide()
		},
		threeDSecureModalShow() {
			this.hide()
		},
		threeDSecureModalHidden() {
			this.show()
		},
	},
}
</script>

<style scoped></style>
