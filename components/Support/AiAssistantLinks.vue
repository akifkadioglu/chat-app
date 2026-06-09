<template>
	<div>
		<a
			v-if="showChatGPT"
			:href="'https://chatgpt.com/?prompt=' + prompt"
			target="_blank"
			rel="noopener noreferrer nofollow"
			:class="btnClass"
		>
			<OpenAILogo class="text-lg" />
			<span class="w-fit truncate">{{ $t('components.support.aiAssistantLinks.chatgpt') }}</span>
		</a>
		<a
			v-if="showGemini"
			:href="'https://www.google.com/search?udm=50&q=' + prompt"
			target="_blank"
			rel="noopener noreferrer nofollow"
			:class="btnClass"
		>
			<GeminiLogo class="text-lg" />
			<span v-if="showLabels" class="w-fit truncate">
				{{ $t('components.support.aiAssistantLinks.google') }}
			</span>
		</a>
		<a
			v-if="showClaude"
			:href="'https://claude.ai/new?q=' + prompt"
			target="_blank"
			rel="noopener noreferrer nofollow"
			:class="btnClass"
		>
			<ClaudeLogo class="text-lg" />
			<span v-if="showLabels" class="w-fit truncate">
				{{ $t('components.support.aiAssistantLinks.claude') }}
			</span>
		</a>
		<a
			v-if="showGrok"
			:href="'https://grok.com/?q=' + prompt"
			target="_blank"
			rel="noopener noreferrer nofollow"
			:class="btnClass"
		>
			<GrokLogo class="text-lg" />
			<span v-if="showLabels" class="w-fit truncate">
				{{ $t('components.support.aiAssistantLinks.grok') }}
			</span>
		</a>
		<a
			v-if="showPerplexity"
			:href="'https://www.perplexity.ai/search?q=' + prompt"
			target="_blank"
			rel="noopener noreferrer nofollow"
			:class="btnClass"
		>
			<PerplexityLogo class="text-lg" />
			<span v-if="showLabels" class="w-fit truncate">
				{{ $t('components.support.aiAssistantLinks.perplexity') }}
			</span>
		</a>
	</div>
</template>

<script>
import GeminiLogo from '~/assets/images/logos/gemini.svg?skipsvgo'
import OpenAILogo from '~/assets/images/logos/openai.svg?skipsvgo'
import ClaudeLogo from '~/assets/images/logos/claude.svg?skipsvgo'
import GrokLogo from '~/assets/images/logos/grok.svg?skipsvgo'
import PerplexityLogo from '~/assets/images/logos/perplexity.svg?skipsvgo'

export default {
	components: {
		GeminiLogo,
		OpenAILogo,
		ClaudeLogo,
		GrokLogo,
		PerplexityLogo,
	},
	props: {
		prompt: {
			type: String,
			required: true,
		},
		showLabels: {
			type: Boolean,
			default: false,
		},
		btnClass: {
			type: String,
			default: 'btn btn-sm gap-2',
		},
		showChatGPT: {
			type: Boolean,
			default: true,
		},
		showGemini: {
			type: Boolean,
			default: true,
		},
		showClaude: {
			type: Boolean,
			default: true,
		},
		showGrok: {
			type: Boolean,
			default: true,
		},
		showPerplexity: {
			type: Boolean,
			default: true,
		},
	},
}
</script>
