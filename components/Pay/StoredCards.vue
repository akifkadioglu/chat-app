<template>
	<div>
		<State :is-empty="cards.length === 0" empty-title="Henüz kart yok">
			<div>
				<div class="text-lg font-medium mb-5">Saved Cards</div>
				<div class="space-y-10">
					<div v-for="(card, index) in cards" :key="index">
						<div class="flex justify-between flex-wrap gap-2">
							<div class="flex items-center gap-4 flex-1">
								<img :src="getCardLogo(card.card_assoc)" alt="Card Logo" class="w-12 h-auto rounded-md" />
								<div>
									<p class="text-muted">{{ card.card_alias }}</p>
									<p class="text-lg">***{{ card.last_four_digits }}</p>
								</div>
							</div>

							<div class="flex items-center gap-2 justify-end flex-1">
								<button
									v-if="showPayButton"
									:disabled="isLoading"
									class="btn btn-primary btn-soft btn-block rounded-lg btn-transition min-w-36"
									@click="payWithCard(card)"
								>
									<loading-element :is-loading="isLoading && loadingStoreCardId === card.id">
										{{ $t('components.pay.storedCards.payButton') }}
									</loading-element>
								</button>
								<span
									v-if="showRemoveButton"
									v-tooltip="cards.length === 1 ? $t('components.pay.storedCards.atLeastOneCard') : ''"
								>
									<button
										:disabled="isLoading || cards.length === 1"
										class="btn btn-error btn-soft btn-transition"
										@click="removeCard(card.id)"
									>
										<loading-element :is-loading="isLoading && loadingStoreCardId === card.id">
											{{ $t('components.pay.storedCards.removeCard') }}
										</loading-element>
									</button>
								</span>
							</div>
						</div>

						<div class="text-sm text-muted">
							<div
								v-if="!showPayButton && card.last_payment && card.last_payment.status !== '1'"
								class="text-error mb-1"
							>
								<i>{{ card.last_payment.error_message }}</i>
							</div>
							<i18n-t keypath="components.pay.storedCards.expiresAtText" tag="div">
								<template #date>
									{{ dayjs(card.expiry_date).format('MMMM YYYY') }}
								</template>
							</i18n-t>
						</div>
					</div>
				</div>
			</div>
		</State>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import dayjs from 'dayjs'
import apiList from '~/apis/ApiList.js'
export default {
	components: { State, LoadingElement },
	props: {
		cards: {
			type: Array,
			required: true,
		},
		showPayButton: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		subscriptionPlanPriceId: {
			type: Number,
			default: null,
		},
		showRemoveButton: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			loadingStoreCardId: null,
		}
	},
	emits: ['payWithStoredCard', 'removeCardById'],
	methods: {
		dayjs,
		payWithCard(card) {
			this.$emit('payWithStoredCard', {
				storedCardId: card.id,
				subscriptionPlanPriceId: this.subscriptionPlanPriceId,
			})
			this.loadingStoreCardId = card.id
		},
		removeCard(storedCardId) {
			this.$swal
				.fire({
					title: this.$t('components.pay.storedCards.removePopup.title'),
					text: this.$t('components.pay.storedCards.removePopup.text'),
					icon: 'warning',
					showDenyButton: true,
					denyButtonText: this.$t('components.pay.storedCards.removePopup.confirmButton'),
					confirmButtonText: this.$t('components.pay.storedCards.removePopup.cancelButton'),
				})
				.then((result) => {
					if (result.isDenied) {
						this.$emit('removeCardById', storedCardId)
					}
				})
		},

		getCardLogo(cardAssoc) {
			switch (cardAssoc) {
				case 'MASTER_CARD':
					return '/images/card-providers/mastercard.svg'
				case 'VISA':
					return '/images/card-providers/visa.svg'
				case 'AMEX':
					return '/images/card-providers/amex.svg'
				case 'DISCOVER':
					return '/images/card-providers/discover.svg'
				case 'JCB':
					return '/images/card-providers/jcb.svg'
				case 'MAESTRO':
					return '/images/card-providers/maestro.svg'
				default:
					return '/images/card-providers/none.svg'
			}
		},
	},
}
</script>
