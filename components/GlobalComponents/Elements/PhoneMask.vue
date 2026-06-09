<template>
	<input v-model="input" type="tel" :placeholder="placeholder" />
</template>

<script>
import loadExternalScript from '~/helpers/loadExternalScript'
import { consoleLog } from '#imports'

export default {
	components: {},
	props: {
		modelValue: {
			type: String,
			default: '',
		},
	},
	// data () {
	// return {
	//   callingCode: ''
	// }
	//
	// const countryCode = this.$store.state.session.data?.country ?? null
	// if (!countryCode) {
	//   return {
	//     callingCode: ''
	//   }
	// }
	// try {
	//   const callingCode = window.libphonenumber.getCountryCallingCode(countryCode)
	//   return {
	//     callingCode: '+' + callingCode + ' '
	//   }
	// } catch (e) {
	//   return {
	//     callingCode: ''
	//   }
	// }
	// },
	data() {
		return {
			input: this.modelValue,
			callingCode: '',
			placeholder: '',
		}
	},
	watch: {
		modelValue(newValue) {
			if (newValue !== this.input) {
				this.input = newValue
			}
		},
		input(newValue, oldValue) {
			let val = newValue
			if (val.length === 0 && oldValue.length > 1) {
				this.input = this.callingCode
			}

			if (val.length > 4) {
				this.input = this.formatNumber(val)
			}
			this.$emit('update:modelValue', val)
		},
		'sessionStore.data.country'(newValue) {
			this.callingCode = this.getCallingCode()
		},
	},
	// computed: {
	//   inputVal: {
	//     get() {
	//       return this.value
	//     },
	//     set(val) {
	//       this.$emit('update:modelValue', val)
	//       // if (process.client) {
	//       //   if (typeof window.libphonenumber?.AsYouType === 'function') {
	//       //     this.$emit('input:modelValue', new window.libphonenumber.AsYouType().input(val))
	//       //   } else {
	//       //     console.log('we\'ve found the issue happens sometimes')
	//       //   }
	//       // }
	//     }
	//   }
	// },
	mounted() {
		if (import.meta.client) {
			loadExternalScript(
				'https://cdnjs.cloudflare.com/ajax/libs/libphonenumber-js/1.10.8/libphonenumber-js.min.js',
			).then(() => {
				this.callingCode = this.getCallingCode()
				if (this.input === '') {
					this.input = this.callingCode
				}
			})
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	methods: {
		getCallingCode() {
			let callingCode = ''
			const countryCode = this.sessionStore.data?.country ?? null
			consoleLog('countryCode', countryCode)
			try {
				const countryCallingCode = window.libphonenumber.getCountryCallingCode(countryCode)
				consoleLog('countryCode callingCode', countryCallingCode)
				callingCode = '+' + countryCallingCode
			} catch (e) {
				callingCode = ''
			}

			this.placeholder = this.formatNumber(callingCode + '5432106789')
			return callingCode
		},
		formatNumber(number) {
			if (typeof window.libphonenumber?.AsYouType === 'function') {
				return new window.libphonenumber.AsYouType().input(number)
			}
			return number
		},
	},
}
</script>

<style scoped></style>
