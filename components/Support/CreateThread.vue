<template>
	<div class="p-4 h-full overflow-y-auto">
		<CreateThreadForm @sent="$emit('threadCreated', $event)" class="!space-y-2 justify-between h-full" />
	</div>
</template>

<script>
import CreateThreadForm from '~/components/GlobalComponents/Threads/CreateThreadForm.vue'

export default {
	name: 'CreateThread',
	components: {
		CreateThreadForm,
	},
	emits: ['threadCreated'],
}
</script>
