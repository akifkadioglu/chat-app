import apiList from '@/apis/ApiList'
import { defineStore } from 'pinia'
import { consoleLog } from '#imports'
import { PlanGroup } from '~/models/Pricing/PlanGroup.ts'
import { Plan } from '~/models/Pricing/Plan'
// import { useRequestAdapter } from '~/composables/useRequestAdapter.js'

export const useProductsStore = defineStore('products', {
	state: (): {
		subscriptionPlans: Array<PlanGroup>
		productsFetching: boolean
	} => ({
		subscriptionPlans: [],
		productsFetching: false,
	}),
	actions: {
		setProducts(products) {
			this.subscriptionPlans = products.subscription_plans.map((ps) => new PlanGroup(ps.map((p) => new Plan(p))))
			consoleLog('setProducts', this.subscriptionPlans)
		},
		async getProducts() {
			consoleLog('getProducts started')
			if (this.subscriptionPlans.length === 0) {
				await this.fetchProducts()
			}
			return this
		},
		async fetchProducts() {
			if (this.productsFetching) {
				return
			}
			this.productsFetching = true
			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.get(apiList.prices.subscription.chatPlans)
				.then((response: any) => {
					consoleLog('productsts response', response)
					this.setProducts(response.data)
					return response
				})
				.catch((reason: any) => {
					consoleLog('productsts', reason)
				})
				.finally(() => {
					this.productsFetching = false
				})
			consoleLog('productsts finally')
		},
	},
})
