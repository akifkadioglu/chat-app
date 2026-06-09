<script>
export default {
	props: {
		errorMessage: {},
	},
	name: 'ErrorHandler',
}
</script>

<template>
	<transition name="errorMessage" enter-active-class="animate__animated animate__fadeIn">
		<div v-if="errorMessage" class="alert alert-error items-start flex alert-soft">
			<i class="fa fa-exclamation-circle shrink-0 mt-1" />
			<span class="break-words whitespace-normal w-full flex-1 pe-5">
				{{ errorMessage }}
			</span>
		</div>
	</transition>
</template>

<style scoped></style>
