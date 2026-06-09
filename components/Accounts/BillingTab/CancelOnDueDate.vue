<template>
	<div class="alert alert-warning alert-soft">
		<div>
			<i class="fa fa-exclamation" />
			<i18n-t tag="span" keypath="components.accounts.billingTab.cancelOnDueDate.willBeCancelledText">
				<template #date>
					<span class="font-bold">
						{{ $formatDate(subscription?.renew_at, $i18n.locale) }}

						<!--						{{ new Date(subscription?.renew_at).toLocaleDateString($i18n.locale) }}-->
					</span>
				</template>
			</i18n-t>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		subscription: {
			type: Object,
			required: true,
		},
	},
}
</script>

<style></style>
