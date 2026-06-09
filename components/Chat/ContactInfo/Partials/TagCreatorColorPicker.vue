<template>
	<div class="flex flex-wrap justify-center gap-2 py-2">
		<div
			v-for="color in ['#3b82f6', '#a855f7', '#ec4899', '#22c55e', '#eab308', '#ef4444', '#06b6d4']"
			:key="color"
			@click="newTag.color = color"
			class="size-7 rounded-full cursor-pointer transition-all duration-150"
			:style="`background-color: ${color}`"
			:class="[newTag.color === color ? 'ring-2 ring-offset-1 ring-base-content/30 scale-110' : 'hover:scale-105']"
		/>
		<label class="relative rounded-full">
			<i class="fa-solid fa-palette text-2xl" :style="{ color: newTag.color }" />
			<input v-model="newTag.color" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="color" />
		</label>
	</div>
</template>
<script>
export default {
	props: {
		newTag: {
			type: Object,
			required: true,
		},
	},
}
</script>

<style scoped></style>
