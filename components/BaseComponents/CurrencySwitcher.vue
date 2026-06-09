<template>
	<CustomDropdown ref="currencySwitcherDropdown">
		<button class="btn btn-soft btn-xs text-nowrap" type="button" :class="btnClass">
			<loading-element :is-loading="isLoading">
				<span class="notranslate">{{ currencyCode }}</span>
				<i class="fa ms-2" :class="{ 'fa-minus': dropdownOpen, 'fa-plus': !dropdownOpen }" />
			</loading-element>
		</button>
		<template #popper="{ shown, hide }">
			<ul tabindex="0" class="dropdown-content space-y-2 menu bg-base-100 rounded-md shadow-lg pt-4 w-48 z-[999]">
				<li v-for="currency in currencies" :key="currency.code" @click="hide">
					<button @click="changeCurrency(currency.code)">
						<b class="notranslate">{{ currency.code }}</b>
						<small class="notranslate text-muted">{{ currency.name }}</small>
					</button>
				</li>
			</ul>
		</template>
	</CustomDropdown>
</template>

<script>
import apiList from '~/apis/ApiList'
import { consoleLog } from '#imports'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown, LoadingElement },
	props: {
		btnClass: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			currencies: [
				{
					code: 'USD',
					name: 'US Dollar',
				},
				{
					code: 'EUR',
					name: 'Euro',
				},
				{
					code: 'TRY',
					name: 'Turkish Lira',
				},
				{
					code: 'ARS',
					name: 'Argentine Peso',
				},
				{
					code: 'COP',
					name: 'Colombian Peso',
				},
				{
					code: 'CLP',
					name: 'Chilean Peso',
				},
				{
					code: 'MXN',
					name: 'Mexican Peso',
				},
				{
					code: 'RUB',
					name: 'Russian Ruble',
				},
				{
					code: 'BRL',
					name: 'Brazilian Real',
				},
			],
			dropdownOpen: false,
			isLoading: false,
		}
	},
	setup() {
		return {
			auth: useAuthStore(),
			sessionStore: useSessionStore(),
			productsStore: useProductsStore(),
		}
	},
	computed: {
		currencyCode() {
			return this.currencies.find((currency) => currency.code === this.sessionStore.data.currency)?.code
		},
	},
	mounted() {
		const currencySwitcherDropdown = this.$refs.currencySwitcherDropdown
		// currencySwitcherDropdown.addEventListener(
		// 	'shown.bs.dropdown',
		// 	function () {
		// 		this.dropdownOpen = true
		// 	}.bind(this),
		// )
		// currencySwitcherDropdown.addEventListener(
		// 	'hidden.bs.dropdown',
		// 	function () {
		// 		this.dropdownOpen = false
		// 	}.bind(this),
		// )
	},
	methods: {
		changeCurrency(currency) {
			this.isLoading = true
			this.$requestAdapter
				.post(apiList.changeCurrency, { currencyCode: currency })
				.then(async (response) => {
					consoleLog(response)
					this.sessionStore.setData(response.data.session)
					// this.$store.commit('session/add', response.data.data.session)

					await this.productsStore.fetchProducts()
					// await this.$store.dispatch('products/fetchProducts')
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>

<style scoped></style>
