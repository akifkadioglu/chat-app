const BASE_URL = import.meta.env.VITE_BASE_URL
const SIGNATURE_BRAND_NAME = 'Simpliers CHAT'
const SIGNATURE_USERNAME = '@simplierschat'

export const SIGNATURE_MESSAGES: Record<string, { text: string; buttonText: string; path: string }> = {
	tr_TR: {
		text: `Bu mesaj ${SIGNATURE_BRAND_NAME} ile otomatik olarak gönderilmiştir ✨`,
		buttonText: 'Otomasyonları Keşfet',
		path: new URL('/tr/kullanim/yorum-dm', BASE_URL).href,
	},

	en_US: {
		text: `This message was automatically sent by ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Discover Automations',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	en_GB: {
		text: `This message was automatically sent by ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Discover Automations',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	pt_BR: {
		text: `Esta mensagem foi enviada automaticamente pelo ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Explorar Automações',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	pt_PT: {
		text: `Esta mensagem foi enviada automaticamente pelo ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Explorar Automações',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	es_ES: {
		text: `Este mensaje fue enviado automáticamente por ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Descubrir Automatizaciones',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	es_MX: {
		text: `Este mensaje fue enviado automáticamente por ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Descubrir Automatizaciones',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	fr_FR: {
		text: `Ce message a été envoyé automatiquement par ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Découvrir les automatisations',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	de_DE: {
		text: `Diese Nachricht wurde automatisch von ${SIGNATURE_BRAND_NAME} gesendet ✨`,
		buttonText: 'Automatisierungen entdecken',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	it_IT: {
		text: `Questo messaggio è stato inviato automaticamente da ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Scopri le automazioni',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},

	ro_RO: {
		text: `Acest mesaj a fost trimis automat de ${SIGNATURE_BRAND_NAME} ✨`,
		buttonText: 'Descoperă automatizările',
		path: new URL('/case/comment-dm', BASE_URL).href,
	},
}
export const SIGNATURE_COMMENTS: Record<string, { text: string }> = {
	tr_TR: {
		text: `${SIGNATURE_USERNAME} ile otomatik yanıtlandı ✨`,
	},

	en_US: {
		text: `Automatically replied by ${SIGNATURE_BRAND_NAME} ✨`,
	},

	en_GB: {
		text: `Automatically replied by ${SIGNATURE_BRAND_NAME} ✨`,
	},

	pt_BR: {
		text: `Respondido automaticamente por ${SIGNATURE_BRAND_NAME} ✨`,
	},

	pt_PT: {
		text: `Respondido automaticamente por ${SIGNATURE_BRAND_NAME} ✨`,
	},

	es_ES: {
		text: `Respondido automáticamente por ${SIGNATURE_BRAND_NAME} ✨`,
	},

	es_MX: {
		text: `Respondido automáticamente por ${SIGNATURE_BRAND_NAME} ✨`,
	},

	fr_FR: {
		text: `Répondu automatiquement par ${SIGNATURE_BRAND_NAME} ✨`,
	},

	de_DE: {
		text: `Automatisch beantwortet von ${SIGNATURE_BRAND_NAME} ✨`,
	},

	it_IT: {
		text: `Risposta automatica inviata da ${SIGNATURE_BRAND_NAME} ✨`,
	},

	ro_RO: {
		text: `Răspuns automat generat de ${SIGNATURE_BRAND_NAME} ✨`,
	},
}
