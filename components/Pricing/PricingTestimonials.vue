<template>
	<div class="flex items-start flex-col sm:flex-row sm:items-center gap-2">
		<div class="flex -space-x-4">
			<div
				class="size-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:z-1"
				v-for="testimonial in testimonials"
			>
				<div class="w-full h-full rounded-full bg-base-100 overflow-hidden">
					<img :src="testimonial.profile_picture" :alt="testimonial.username" v-img-error />
				</div>
			</div>
		</div>
		<i18n-t keypath="components.pricing.testimonials.confidenceText" tag="div" class="text-sm wrap-break-word w-full">
			<template #profiles>
				<span>
					<span v-for="(testimonial, index) in testimonials" :key="index" class="font-semibold wrap-break-word">
						<span class="inline-block align-middle"> {{ testimonial.username }} </span
						><is-verified-img
							v-if="testimonial.is_verified"
							:width="16"
							class="inline-block align-middle ml-0.5"
						/><span>{{ getComma(index) }}</span>
					</span>
				</span>
			</template>
		</i18n-t>
	</div>
</template>
<script>
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'

export default {
	components: { IsVerifiedImg },
	setup() {
		return {
			testimonialsStore: useTestimonialsStore(),
		}
	},
	data() {
		return {
			testimonials: [],
		}
	},
	mounted() {
		this.testimonialsStore.getTestimonials().then(() => {
			this.testimonials = this.getRandomTestimonial()
		})
	},
	methods: {
		getRandomTestimonial() {
			const selectedTestimonials = []
			const testimonialsCount = 3

			const selectedCountry = this.testimonialsStore.country
				.slice()
				.sort(() => 0.5 - Math.random())
				.slice(0, testimonialsCount)
			selectedTestimonials.push(...selectedCountry)

			if (selectedCountry.length !== testimonialsCount) {
				const selectedLocale = this.testimonialsStore.locale
					.slice()
					.sort(() => 0.5 - Math.random())
					.slice(0, testimonialsCount)
				const diff = testimonialsCount - selectedTestimonials.length
				selectedTestimonials.push(...selectedLocale.slice(0, diff))
			}
			return selectedTestimonials
		},
		getComma(index) {
			return index !== this.testimonials.length - 1 ? ', ' : ' '
		},
	},
}
</script>

<style scoped></style>
