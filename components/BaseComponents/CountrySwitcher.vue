<template>
	<CustomDropdown ref="countrySwitcherDropdown" @show="onShow" @hide="onHide">
		<button class="btn btn-soft btn-xs text-nowrap" type="button" :class="btnClass">
			<loading-element :is-loading="isLoading">
				<span class="notranslate">{{ countryCode }}</span>
				<i class="fa ml-2" :class="{ 'fa-minus': dropdownOpen, 'fa-plus': !dropdownOpen }" />
			</loading-element>
		</button>
		<template #popper="{ shown, hide }">
			<div tabindex="0" class="dropdown-content bg-base-100 rounded-md shadow-lg p-4 w-64 z-[999]">
				<div class="flex items-center gap-2">
					<input
						ref="currentCountryInput"
						v-model="currentCountry"
						class="input input-bordered input-sm w-full"
						type="text"
						maxlength="2"
						@input="currentCountry = currentCountry.toUpperCase()"
						@focus="$event.target.select()"
					/>
					<button class="btn btn-success btn-xs" @click="changeCountry(); hide()">
						<i class="fa fa-save" />
					</button>
				</div>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import apiList from '~/apis/ApiList'
import { consoleLog } from '#imports'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { LoadingElement, CustomDropdown },
	props: {
		btnClass: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			countries: [],
			currentCountry: null,
			dropdownOpen: false,
			isLoading: false,
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
			productsStore: useProductsStore(),
		}
	},
	computed: {
		countryCode() {
			return this.sessionStore.data.country
		},
	},
	mounted() {
		this.currentCountry = this.countryCode
	},
	methods: {
		onShow() {
			this.dropdownOpen = true
			this.$nextTick(() => {
				this.$refs.currentCountryInput?.focus()
			})
		},
		onHide() {
			this.dropdownOpen = false
		},
		changeCountry() {
			if (!this.currentCountry || this.currentCountry === this.countryCode) {
				return
			}
			this.isLoading = true

			this.$requestAdapter
				.post(apiList.changeCountry, { country: this.currentCountry })
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
