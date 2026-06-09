<template>
	<div>
		<Form class="space-y-7" ref="form" @submit="handleSubmit" :lang="$i18n.locale">
			<!-- Card Holder -->
			<div>
				<label>
					<span class="text-sm text-muted"> {{ $t('components.pay.paymentForm.cardHolder.label') }} </span>
					<Field
						name="cardHolder"
						:label="$t('components.pay.paymentForm.cardHolder.label')"
						rules="required"
						v-slot="v"
						:validateOnInput="false"
						:validateOnChange="true"
						:validateOnBlur="false"
						:validateOnMount="false"
					>
						<input
							v-bind="v.field"
							class="input w-full border-1 h-11"
							:class="[
								!v.meta.valid && v.meta.validated ? inputErrorClasses : '',
								v.meta.valid && v.meta.validated ? inputSuccessClasses : '',
							]"
							:placeholder="$t('components.pay.paymentForm.cardHolder.placeholder')"
							type="text"
							autocomplete="text"
							autofocus
							@input="(e) => v.field.onChange($capitalize(e.target.value, $i18n.locale))"
						/>
						<div class="text-error text-sm mt-2">
							{{ v.errors[0] }}
						</div>
					</Field>
				</label>
			</div>

			<!-- Card Number -->
			<div>
				<label>
					<span class="text-sm text-muted"> {{ $t('components.pay.paymentForm.cardNumber.label') }} </span>
					<Field
						name="cardNumber"
						:rules="'required|max:19|min:' + getCardType?.cardNumLength || 19"
						v-slot="v"
						:validateOnInput="false"
						:validateOnChange="true"
						:validateOnBlur="false"
						:validateOnMount="false"
					>
						<div class="relative">
							<MaskInput
								v-bind="v.field"
								class="input w-full border-1 h-11"
								:class="[
									!v.meta.valid && v.meta.validated ? inputErrorClasses : '',
									v.meta.valid && v.meta.validated ? inputSuccessClasses : '',
								]"
								:placeholder="$t('components.pay.paymentForm.cardNumber.placeholder')"
								type="text"
								autocomplete="text"
								autofocus
								:mask="getCardType?.mask || '#### #### #### ####'"
							/>
							<img
								class="absolute h-8 z-1 right-2 top-1/2 -translate-y-1/2"
								:src="`/images/card-providers/${getCardType?.type}.svg`"
								:alt="getCardType?.type"
							/>
						</div>
					</Field>
				</label>
			</div>

			<!-- Expiry & CVV -->
			<div class="flex gap-4">
				<div class="flex-1">
					<label>
						<span class="text-sm text-muted"> {{ $t('components.pay.paymentForm.expiryDate.label') }} </span>
						<Field
							name="cardExpDate"
							:label="$t('components.pay.paymentForm.expiryDate.label')"
							rules="required|min:5|max:5|expdatecheck"
							v-slot="v"
							:validateOnInput="false"
							:validateOnChange="true"
							:validateOnBlur="false"
							:validateOnMount="false"
						>
							<mask-input
								v-bind="v.field"
								:class="[
									!v.meta.valid && v.meta.validated ? inputErrorClasses : '',
									v.meta.valid && v.meta.validated ? inputSuccessClasses : '',
								]"
								class="input w-full border-1 h-11"
								:placeholder="$t('components.pay.paymentForm.expiryDate.placeholder')"
								type="text"
								autocomplete="text"
								autofocus
								mask="##/##"
							/>
							<div class="text-error text-sm mt-2">
								{{ v.errors[0] }}
							</div>
						</Field>
					</label>
				</div>

				<div class="flex-1">
					<label>
						<span class="text-sm text-muted"> {{ $t('components.pay.paymentForm.cvv.label') }} </span>
						<Field
							name="cardCvv"
							:rules="'required|max:4|min:' + getCardType?.cvvLength || 3"
							v-slot="v"
							:validateOnInput="false"
							:validateOnChange="true"
							:validateOnBlur="false"
							:validateOnMount="false"
						>
							<div class="relative">
								<mask-input
									v-bind="v.field"
									:class="[
										!v.meta.valid && v.meta.validated ? inputErrorClasses : '',
										v.meta.valid && v.meta.validated ? inputSuccessClasses : '',
									]"
									class="input w-full border-1 h-11"
									:placeholder="getCardType?.cvvLength === 4 ? '••••' : '•••'"
									type="password"
									autocomplete="text"
									autofocus
									:mask="getCardType?.cvvLength === 3 ? '###' : '####'"
								/>
								<CardCvvLocation
									:card-cvv-location="getCardType.cardCvvLocation"
									class="absolute right-2 top-1/2 -translate-y-1/2 z-1"
								/>
							</div>
						</Field>
					</label>
				</div>
			</div>

			<!-- Security Features -->
			<label class="flex gap-2 pointer-events-none opacity-50">
				<input type="checkbox" class="checkbox checkbox-xs mt-1" checked />
				<span class="flex flex-col">
					<span>{{ $t('components.pay.paymentForm.security.title') }}</span>
					<span class="text-xs text-muted">
						{{ $t('components.pay.paymentForm.security.description') }}
					</span>
				</span>
			</label>

			<!-- Submit Button -->
			<div class="pt-2" v-if="subscriptionPlan">
				<button
					:disabled="isLoading"
					type="submit"
					class="font-normal text-sm btn btn-primary w-full btn-lg hover:shadow-lg btn-transition"
				>
					<loading-element :is-loading="isLoading" />
					<i18n-t :keypath="payButtonTextPath">
						<template #price>
							<AnimatedPrice
								:execPrice="execPrice"
								:showPeriod="false"
								:symbolOnLeft="subscriptionPlan.price?.execCurrency.symbolOnLeft"
								:symbol="subscriptionPlan.price?.execCurrency.symbol"
							/>
						</template>
						<!--						<template #currency>{{ subscriptionPlan.price?.execCurrency.baseCode }}</template>-->
					</i18n-t>
				</button>
			</div>
		</Form>
	</div>
</template>
<script>
import { defineRule, Field, Form } from 'vee-validate'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { MaskInput } from 'vue-3-mask'
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import CardCvvLocation from '~/components/Pay/CardCvvLocation.vue'
import { Plan } from '~/models/Pricing/Plan.ts'
import AnimatedPrice from '~/components/Pricing/AnimatedPrice.vue'

export default {
	props: {
		subscriptionPlan: {
			type: Plan,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		execPrice: {
			type: Number,
			default: 0,
		},
		payButtonTextPath: {
			type: String,
			default: 'components.pay.paymentForm.payButton',
		},
	},
	components: {
		AnimatedPrice,
		CardCvvLocation,
		AnimatedNumber,
		LoadingElement,
		Form,
		Field,
		MaskInput,
	},
	data() {
		return {
			formCtx: null,
			inputSuccessClasses: 'input-success shadow-success/10 shadow-lg',
			inputErrorClasses: 'input-error shadow-error/10 shadow-lg',
		}
	},
	mounted() {
		this.formCtx = this.$refs.form
	},
	setup() {
		const { t } = useI18n()
		defineRule('expdatecheck', (value) => {
			if (!value) return true
			const month = parseInt(value.substring(0, 2))
			const year = parseInt(value.substring(3, 5))

			if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
				return t('plugins.veeValidate.expDateCheck')
			}
			const now = new Date()
			const expDate = new Date(2000 + year, month)

			if (expDate < now) {
				consoleLog('expDate < now', expDate < now)
				return t('plugins.veeValidate.dateInvalid')
			}
			return true
		})
	},
	emits: ['paymentSubmitted'],
	computed: {
		getCardType() {
			const cardType = {
				type: 'none',
				mask: '#### #### #### ####',
				cvvLength: 3,
				cardNumLength: 19,
				cardCvvLocation: 'back',
			}

			if (!this.formCtx) {
				return cardType
			}

			const values = this.formCtx.values
			const cardNum = values.cardNumber ?? ''
			const maestroStartsWith = [50, 56, 57, 58, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69]
			if (cardNum.startsWith('4')) {
				cardType.type = 'visa'
			}
			if (parseInt(cardNum.substring(0, 2)) >= 51 && parseInt(cardNum.substring(0, 2)) <= 55) {
				cardType.type = 'mastercard'
			}
			if (maestroStartsWith.includes(parseInt(cardNum.substring(0, 2)))) {
				cardType.type = 'maestro'
			}
			if (cardNum.startsWith('34') || cardNum.startsWith('37')) {
				cardType.mask = '#### ###### #####'
				cardType.type = 'amex'
				cardType.cvvLength = 4
				cardType.cardNumLength = 17
				cardType.cardCvvLocation = 'front'
			}
			if (cardNum.startsWith('6')) {
				cardType.type = 'discover'
			}
			if (cardNum.startsWith('3528') || cardNum.startsWith('3589')) {
				cardType.type = 'jcb'
			}
			if (cardNum.startsWith('9792')) {
				cardType.type = 'troy'
			}
			return cardType
		},
	},
	methods: {
		handleSubmit(values) {
			const formValues = {
				...values,
				cardNumber: values.cardNumber.replace(/\s/g, ''),
				cardExpDate: values.cardExpDate.replace(/\//g, ''),
				subscriptionPlanPriceId: this.subscriptionPlan.price.id,
				storeCard: true,
			}
			this.$emit('paymentSubmitted', formValues)
		},
	},
}
</script>
