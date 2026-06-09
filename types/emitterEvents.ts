import { Conversation } from '~/models/Conversation/Conversation'
import { ChatAccount } from '~/models/ChatAccount'

export type AppEvents = {
	chatAccountsLoading: void
	newMessage: { id: number; text: string }
	openChat: { chatId: number }

	showAddAccountModal: { closeable?: boolean }
	hideAddAccountModal: void
	setLoadingAddAccountModal: any

	selectAccount: number
	getChatAccounts: void
	getConversations: void
	chatAccountsError: any
	chatAccountsLoaded: any
	closeDropdowns: void
	showUpgradeModal: {
		chatAccount: ChatAccount | null
		feature: string
		allowClose?: boolean
	}

	showCreateFlowModal: void

	showActiveContactsInfoModal: void

	openSupportLauncher: void
	closeSupportLauncher: void

	paymentSuccess: void
	flowPublished: void
	accountAdded: void
}
