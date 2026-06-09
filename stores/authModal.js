import { defineStore } from 'pinia'

export const useAuthModalStore = defineStore('authModal', {
	state: () => ({
		googleSignInInitialized: false,
	}),
})
