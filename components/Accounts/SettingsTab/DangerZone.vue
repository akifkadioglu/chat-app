<template>
	<div class="card bg-error/5 border border-error/20">
		<div class="card-body">
			<h3 class="card-title mb-4 text-error">
				<i class="fa fa-exclamation-triangle mr-2" />
				{{ $t('components.accounts.settingsTab.dangerZone.title') }}
			</h3>

			<div class="space-y-4">
				<div class="p-4 bg-base-100 rounded-lg border border-error/20">
					<div class="flex items-center justify-between">
						<div>
							<h4 class="font-medium text-error">
								{{ $t('components.accounts.settingsTab.dangerZone.deleteAccount.title') }}
							</h4>
							<p class="text-sm text-base-content/70">
								{{ $t('components.accounts.settingsTab.dangerZone.deleteAccount.description') }}
							</p>
						</div>
						<button
							@click="deleteAccount"
							class="btn btn-error btn-sm"
							:title="$t('pages.app.accounts.header.deleteAccountTooltip')"
						>
							<i class="fa fa-trash mr-1"></i>
							<span class="hidden md:inline">{{ $t('pages.app.accounts.header.deleteAccountButton') }}</span>
						</button>
					</div>
					<p class="text-sm text-base-content font-semibold mt-1">
						{{ $t('components.accounts.settingsTab.dangerZone.deleteAccount.description2') }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import apiList from '~/apis/ApiList.js'

export default {
	name: 'DangerZone',
	setup() {
		const chatAccountsStore = useChatAccountsStore()
		return {
			chatAccountsStore,
		}
	},
	computed: {
		activeChatAccount() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		async deleteAccount() {
			if (!this.activeChatAccount) return
			const accountToRemove = this.activeChatAccount
			const accountToRemoveId = accountToRemove.id
			const username = accountToRemove.postAccount.username
			const name = accountToRemove.postAccount.name

			const result = await this.$swal.fire({
				title: this.$t('pages.app.accounts.deleteConfirmation.title', { username, name }),
				html: `
					<div class="text-left space-y-3">
						<p class="font-semibold text-error">${this.$t('pages.app.accounts.deleteConfirmation.warningText')}</p>
						<p>${this.$t('pages.app.accounts.deleteConfirmation.dataToBeDeleted')}</p>
						<ul class="list-disc list-inside space-y-1 text-sm">
							<li>${this.$t('pages.app.accounts.deleteConfirmation.chatHistory')}</li>
							<li>${this.$t('pages.app.accounts.deleteConfirmation.connectionInfo')}</li>
							<li>${this.$t('pages.app.accounts.deleteConfirmation.contactList')}</li>
							<li>${this.$t('pages.app.accounts.deleteConfirmation.templates')}</li>
							<li>${this.$t('pages.app.accounts.deleteConfirmation.analytics')}</li>
						</ul>
					</div>
				`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('pages.app.accounts.deleteConfirmation.confirmButton', { username }),
				confirmButtonColor: '#d33',
				cancelButtonText: this.$t('pages.app.accounts.deleteConfirmation.cancelButton'),
				reverseButtons: true,
			})

			if (result.isConfirmed) {
				// Loading göster
				this.$swal.fire({
					title: this.$t('pages.app.accounts.deleteConfirmation.deletingTitle'),
					text: this.$t('pages.app.accounts.deleteConfirmation.deletingText'),
					allowOutsideClick: false,
					allowEscapeKey: false,
					showConfirmButton: false,
					didOpen: () => {
						this.$swal.showLoading()
					},
				})

				this.$requestAdapter
					.post(
						apiList.chat.instagram.chatAccountId.delete,
						{},
						{
							chatAccountId: accountToRemoveId,
						},
					)
					.then((response) => {
						this.$swal.fire({
							title: this.$t('pages.app.accounts.deleteConfirmation.successTitle'),
							text: this.$t('pages.app.accounts.deleteConfirmation.successText'),
							icon: 'success',
							confirmButtonText: this.$t('pages.app.accounts.deleteConfirmation.confirmButtonText'),
						})
						this.chatAccountsStore.removeAccount(accountToRemoveId)
						this.chatAccountsStore.setActive(null)
						// this.selectAccount(this.chatAccountsCount > 0 ? this.chatAccounts[0] : null)
					})
					.catch((error) => {})
					.finally(() => {
						this.$swal.close()
					})
			}
		},
	},
}
</script>

<style scoped></style>
