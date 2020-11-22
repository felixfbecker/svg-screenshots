import './polyfill'

import { inlineResources } from 'dom-to-svg'

browser.runtime.onMessage.addListener(async (message, sender) => {
	const { method, payload } = message
	switch (method) {
		// Disable action while a page is capturing
		case 'started': {
			await browser.browserAction.disable(sender.tab!.id!)
			return
		}
		case 'finished': {
			await browser.browserAction.enable(sender.tab!.id!)
			return
		}
		case 'postProcessSVG': {
			return postProcessSVG(payload)
		}
	}
})

async function postProcessSVG(svg: string): Promise<string> {
	const svgDocument = new DOMParser().parseFromString(svg, 'image/svg+xml')
	await inlineResources(svgDocument.documentElement)
	return new XMLSerializer().serializeToString(svgDocument.documentElement)
}
