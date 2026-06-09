<template>
	<div class="card card-sm mt-3">
		<div class="card-body">
			<StoredCards showRemoveButton :showPayButton="false" :cards="cards" @removeCardById="removeCardById" />
			<div class="mt-3 flex justify-center">
				<button class="btn btn-primary btn-transition flex-1" @click="openAddCardModal">
					{{ $t('components.accounts.billingTab.subscriptionStoredCards.openAddCardModal') }}
				</button>
			</div>
			<AddNewCardModal ref="addNewCardModal" @cardAdded="refreshCards" />
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import StoredCards from '~/components/Pay/StoredCards.vue'
import AddNewCardModal from '~/components/Accounts/BillingTab/AddNewCardModal.vue'

export default {
	props: {
		subscription: {
			type: Object,
			required: true,
		},
	},
	components: {
		AddNewCardModal,
		StoredCards,
	},
	data() {
		return {
			cards: [],
		}
	},
	mounted() {
		this.getCards()
	},
	methods: {
		getCards() {
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
		openAddCardModal() {
			this.$refs.addNewCardModal?.show()
		},
		refreshCards() {
			this.getCards()
		},
		removeCardById(storedCardId) {
			this.$requestAdapter
				.post(
					apiList.prices.card.remove,
					{
						storedCardId,
					},
					{
						params: {
							onlyCreditCards: this.onlyCreditCards,
						},
					},
				)
				.then((response) => {
					this.cards = response.data.cards
					this.$toast.success(this.$t('components.pay.storedCards.removedMessage'))
				})
				.catch(() => {})
		},
	},
}
</script>

<style scoped></style>
