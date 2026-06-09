<template>
	<th>
		<label class="cursor-pointer">
			{{ name }}
			<button @click="$emit('sortBy', fieldKey)">
				<i
					class="fa"
					:class="{
						'fa-sort opacity-25': sortedBy[fieldKey] !== 'asc' && sortedBy[fieldKey] !== 'desc',
						'fa-sort-asc': sortedBy[fieldKey] === 'asc',
						'fa-sort-desc': sortedBy[fieldKey] === 'desc',
					}"
				/>
			</button>
		</label>
	</th>
</template>
<script>
export default {
	name: 'TableHeader',
	props: {
		name: {
			type: String,
		},
		fieldKey: {
			type: String,
		},
		sortedBy: {
			type: Object,
		},
	},
}
</script>

<style scoped></style>
