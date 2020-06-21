import './polyfill'

browser.browserAction.onClicked.addListener(async tab => {
	console.log('Executing content script in tab', tab)
	await browser.tabs.executeScript({
		file: '/src/content.js',
	})
})
