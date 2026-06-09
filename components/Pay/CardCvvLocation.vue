<template>
	<div class="card-type rounded-sm [&_img]:w-8">
		<transition
			name="flip"
			mode="out-in"
			enter-active-class="animate__animated animate__flipInY"
			leave-active-class="animate__animated animate__flipOutY"
		>
			<img v-img-error v-if="cardCvvLocation === 'back'" src="/images/card-providers/card-back.svg" alt="back" />
			<img v-img-error v-else src="/images/card-providers/card-front.svg" alt="back" />
		</transition>
	</div>
</template>

<script>
export default {
	props: {
		cardCvvLocation: {
			type: String,
			default: 'front',
		},
	},
}
</script>

<style scoped></style>
