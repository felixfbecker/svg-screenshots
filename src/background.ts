import './polyfill'

import { fetchAsDataURL } from 'dom-to-svg'

browser.browserAction.onClicked.addListener(async tab => {
	console.log('Executing content script in tab', tab)
	await browser.tabs.executeScript({
		file: '/src/content.js',
	})
})

browser.runtime.onMessage.addListener(async message => {
	const { method, payload } = message
	if (method === 'fetchResourceAsDataURL') {
		const url = payload as string
		console.log('Fetching', url)
		const dataURL = await fetchAsDataURL(url, {
			// Restrict to images and fonts for security.
			accept: ['image/*', 'font/*'],
		})
		return dataURL.href
	}
})
