import './polyfill'

import { fetchAsDataURL } from 'dom-to-svg'

browser.runtime.onMessage.addListener(async (message, sender) => {
	const { method, payload } = message
	switch (method) {
		case 'fetchResourceAsDataURL': {
			const url = payload as string
			console.log('Fetching', url)
			const dataURL = await fetchAsDataURL(url, {
				// Restrict to images and fonts for security.
				accept: ['image/*', 'font/*'],
			})
			return dataURL.href
		}
		// Disable action while a page is capturing
		case 'started': {
			await browser.browserAction.disable(sender.tab!.id!)
			return
		}
		case 'finished': {
			await browser.browserAction.enable(sender.tab!.id!)
			return
		}
	}
})
