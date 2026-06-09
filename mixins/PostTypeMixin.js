import { CommentOnPostType } from '~/models/Flow/utils/utils.js'
import apiList from '~/apis/ApiList.js'

export default {
	data() {
		return {
			isLastPostLoading: false,
		}
	},
	watch: {
		'config.postType'(newVal) {
			if (newVal === CommentOnPostType.NEXT_POST) {
				this.isLastPostLoading = true
				this.$requestAdapter
					.get(apiList.chat.instagram.chatAccountId.lastMediaInfo, {
						chatAccountId: this.chatAccount.id,
					})
					.then((res) => {
						consoleLog('lastMediaInfo', res)
						this.config.lastPostId = res.data.id
						this.config.selectedPostIds = ['{{realPostId}}']
					})
					.finally(() => {
						this.isLastPostLoading = false
					})
				return
			}
			if (newVal === CommentOnPostType.SELECTED_POSTS) {
				this.config.selectedPostIds = []
				this.config.lastPostId = null
				return
			}
			if (newVal === CommentOnPostType.ALL_POSTS) {
				this.config.selectedPostIds = []
				this.config.lastPostId = null
				return
			}
			this.config.lastPostId = null
		},
	},
}
