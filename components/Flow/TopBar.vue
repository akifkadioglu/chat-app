<template>
	<div>
		<div class="py-3">
			<div class="grid grid-cols-4 gap-2 items-center bs container">
				<!--			<div class="flex flex-col">-->
				<div class="col-span-4 sm:col-span-3 flex items-baseline gap-1 truncate">
					<i :class="iconClass" />
					<div class="truncate">
						<div class="font-bold truncate" :class="titleClass">{{ title }}</div>
						<div class="text-muted text-xs text-wrap" :class="descriptionClass">
							<slot name="description">
								{{ description }}
							</slot>
						</div>
					</div>
				</div>
				<div class="col-span-4 sm:col-span-1 flex-1 ml-auto">
					<slot name="button" />
				</div>
				<!--			</div>-->
			</div>
		</div>
		<div class="my-0 border-t border-subtle" />
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
			default: '',
		},
		titleClass: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
		descriptionClass: {
			type: String,
			default: '',
		},
		iconClass: {
			type: String,
			default: '',
		},
	},
}
</script>

<style scoped></style>
